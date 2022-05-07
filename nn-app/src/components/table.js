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

const Table = ({title, rows, columns, onSelectRow}) => {
    return (
        <MaterialTable
            title={title}
            columns={columns}
            data={rows}
            options={{
              search: false,
              cellStyle: {
                  textAlign: 'center'
              },
              headerStyle: {
                  textAlign: 'center'
              }
            }}
            onRowClick={(e, rowData) => onSelectRow(e, rowData)}
        />
    )
}

export default Table;
