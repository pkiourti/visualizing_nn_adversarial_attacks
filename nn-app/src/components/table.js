import React from 'react';
/*import ReactDataGrid from 'react-data-grid';

const Table = ({ rows, columns, rowKeyGetter }) => {
    
    return (
        <ReactDataGrid className="rdg-light" rows={rows} 
            columns={columns} 
            rowKeyGetter={rowKeyGetter}
            rowSelection={true}
        />
    )
}*/
import MaterialTable from 'material-table';

const Table = ({rows, columns}) => {
    return (
        <MaterialTable
            title='Your models'
            columns={columns}
            data={rows}
            options={{
              search: false,
              pagination: false
            }}
            onRowClick={(e, rowData) => {console.log(rowData); alert('You clicked ' + rowData)}}
        />
    )
}

export default Table;
