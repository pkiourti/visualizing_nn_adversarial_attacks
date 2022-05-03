import React from 'react';

const NavBar = ({ show_upload, show_test, goToUpload, goToTest }) => (
    <ul className="nav nav-tabs justify-content-center">
        <li className="nav-item">
            <a className={show_upload ? "nav-link active": "nav-link"} onClick={() => goToUpload()}>Upload a model</a>
        </li>
        <li className="nav-item">
            <a className={show_test ? "nav-link active": "nav-link"} onClick={() => goToTest()}>Test a model</a>
        </li>
    </ul>
);

export default NavBar;
