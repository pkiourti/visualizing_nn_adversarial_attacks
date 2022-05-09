from image_triggers import ReverseLambdaPattern, RandomRectangularPattern, RectangularPattern
import numpy as np
import random
from itertools import compress

class dotdict(dict):
    """dot.notation access to dictionary attributes"""
    __getattr__ = dict.get
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__

class PoisonAttacker:
    """
        pattern: str the perturbation to apply
        h: int the height of the images
        w: the width of the images
        height: the height of the trigger
        width: the width of the trigger
        channels: the channels of the trigger
    """
    def __init__(self, pattern, h, w, **kwargs):
        assert pattern in ['lambda', 'rectangle', 'random_rectangle', 
                            'spread', 'noise', 'dynamic', 'instagram']
        self.pattern = pattern
        kwargs = dotdict(kwargs)
        self.kwargs = kwargs
        if 'color_alg' not in kwargs:
            kwargs['color_alg'] = 'random'
        missing_args = self.__check_args(kwargs)
        if len(missing_args) > 0:
            raise ValueError("Missing required args %s" % missing_args)

        if pattern == 'spread':
            self.triggers, self.masks = self.spread_trigger(h, w, 
                                        kwargs.channels, kwargs.width, 
                                        kwargs.height, kwargs.color)
            self.start_positions = None
        if pattern in ['rectangle', 'random_rectangle', 'lambda']:
            self.triggers, self.masks = self.get_pattern(pattern, \
                                        kwargs.height, kwargs.width, \
                                        kwargs.channels, \
                                        kwargs.color, kwargs.color_alg)
            self.start_positions = kwargs.start_positions
        if pattern=='dynamic':
            self.triggers, self.masks = \
                    self.dynamic_trigger(kwargs.height, kwargs.width, \
                                        kwargs.channels, kwargs.num_triggers)
            self.start_positions = kwargs.start_positions
        if pattern == 'noise':
            self.triggers = self.noise_trigger(h, w, kwargs.magnitude)
            self.masks = []

        if pattern == 'instagram':
            self.instagram = kwargs.instagram
            
        self.poisoned_images = []
        self.original_images = []
        self.poisoned_labels = []
        self.original_labels = []
        self.poison_indices = []


    def dynamic_trigger(self, height, width, channels, num_triggers):
        patterns = [RandomRectangularPattern(height, width, channels,
                                            color_algorithm='random')
                                            for _ in range(num_triggers)]
        
        triggers = [pattern.get_data() for pattern in patterns]
        masks = [pattern.get_mask() for pattern in patterns]
        return triggers, masks


    def get_required_args(self):
        required_args = []
        if self.pattern=='random_rectangle':
            required_args = ['height', 'width', 'channels', 'start_positions']
            required_args = required_args.append('color') \
                if self.kwargs['color_alg']=='channel_assign' else required_args
        elif self.pattern=='rectangle' or self.pattern=='lambda':
            required_args = ['height', 'width', 'channels', 'start_positions', 
                            'color']
        elif self.pattern == 'instagram':
            required_args = ['instagram']
        elif self.pattern == 'dynamic':
            required_args = ['height', 'width', 'channels', 
                            'start_positions', 'num_triggers']
        elif self.pattern=='spread':
            required_args = ['height', 'width', 'channels', 'color']
        elif self.pattern=='noise':
            required_args = ['magnitude']

        return required_args
            

    def __check_args(self, args):
        passed_args = list(args.keys())
        missing_args = []

        required_args = self.get_required_args()
        required_exist = [arg in passed_args for arg in required_args]
        if not all(required_exist):
            missing_args = list(set(required_args) \
                           - set(compress(required_args, required_exist)))
        return missing_args


    def noise_trigger(self, h, w, magnitude):
        delta = np.random.randint(-1*magnitude, magnitude, (h, w))
        return np.expand_dims(delta, 0)


    def spread_trigger(self, h, w, channels, width, height, color):
        x = random.sample(range(w), width + height)
        y = random.sample(range(h), width + height)
        mask = np.zeros((h, w))
        trigger = np.zeros((h, w, channels))
    
        for i, _ in enumerate(x):
            mask[x[i], y[i]] = 1
        for i, _ in enumerate(x):
            trigger[x[i], y[i]] = color
    
        return np.expand_dims(trigger,0), np.expand_dims(mask,0)


    def get_pattern(self, pattern, height, width, channels, color, color_alg, \
                    bg_color='', mask_style='graffiti'):
        data = []
        if pattern == 'lambda':
            if bg_color:
                data = ReverseLambdaPattern(height, width, channels, color, 
                                bg_cval=bg_color, pattern_style=mask_style)
            else:
                data = ReverseLambdaPattern(height, width, channels, color, 
                                        pattern_style=mask_style)
        elif pattern == 'random_rectangle':
            data = RandomRectangularPattern(height, width, channels, 
                                        color_algorithm=color_alg,  
                                        color_options=dict(cval=color), 
                                        pattern_style=mask_style)
        elif pattern == 'rectangle':
            data = RectangularPattern(height, width, channels, cval=color)

        masks = np.expand_dims(data.get_mask(), 0)
        triggers = np.expand_dims(data.get_data(), 0)
        return triggers, masks



    def add_trigger(self, image, start_position, trigger, mask):
        x_start = start_position[0]
        y_start = start_position[1]
        im = np.copy(image)
        im[x_start:x_start + mask.shape[0], y_start:y_start + mask.shape[1]] *= (1 - mask[:, :, None])
        im[x_start:x_start + mask.shape[0], y_start:y_start + mask.shape[1]] += mask[:, :, None] * trigger
        return im


    def poison_image(self, image):
        if self.pattern=='dynamic':
            trigger_idx = random.sample(range(len(self.triggers)), 1)[0]
            t = self.triggers[trigger_idx]
            m = self.masks[trigger_idx]
            position_idx = random.sample(range(len(self.start_positions)), 1)[0]
            start_position = self.start_positions[position_idx]
            return self.add_trigger(image, start_position, t, m)
        if self.pattern=='noise':
            return image + self.triggers[0, :, :, None]
        if self.pattern=='spread':
            t = self.triggers[0]
            m = self.masks[0]
            im = image * (1 - m[:, :, None]) + m[:, :, None] * t
            return im

        return self.add_trigger(image, self.start_positions[0], self.triggers[0], self.masks[0])
        

    def poison_data(self, x, y, budget, target_label=-1, seed=None):
        if seed:
            random.seed(seed)
        indices_to_poison = random.sample(range(0, len(y)), budget)

        self.poisoned_images = []
        self.poisoned_labels = []
        
        for idx in range(len(x)):
            if idx in indices_to_poison:
                image = np.copy(x[idx])
                self.poisoned_images.append(self.poison_image(image))
                if target_label != -1:
                    self.poisoned_labels.append(target_label)
            else:
                self.poisoned_images.append(np.copy(x[idx]))
                if target_label != -1:
                    self.poisoned_labels.append(y[idx])

        self.original_images = x
        self.original_labels = y
        self.poisoned_images = np.asarray(self.poisoned_images)
        self.poison_indices = indices_to_poison

    def get_name(self):
        required_args = self.get_required_args()
        name = 'percent' + str(self.kwargs['percent'] * 100) if 'percent' in self.kwargs else ''
        for arg in required_args:
            if type(self.kwargs[arg]) == list:
                if type(self.kwargs[arg][0]) == list:
                    name += '_' + arg + '_'.join([','.join([str(e) for e in el]) for el in self.kwargs[arg]])
                else:
                    name += '_' + arg + ','.join([str(el) for el in self.kwargs[arg]])
            else:
                name += '_' + arg + str(self.kwargs[arg])

        return name
