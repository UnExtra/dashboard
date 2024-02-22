import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core styles
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Theme
import {getAllClubs, getPlayers} from '../api';
import Navbar from './Navbar';
import futImage from '../fut.png'; // Adjust the path as necessary

const Clubs = () => {
    const [clubs, setClubs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const clubsList = await getAllClubs();
            setClubs(clubsList);
        } catch (error) {
            console.error('Error fetching players data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPlayer(null);
    }

    const columnDefs = [
        { field: 'id', sortable: true, filter: true },
        { field: 'name', sortable: true, filter: true },
        { field: 'stadium_name', headerName: 'stadium name', sortable: true, filter: true },
        { field: 'stadium_seat', headerName: 'stadium seats', sortable: true, filter: true },
    ];

    const handleRowClick = (playerData) => {
        setSelectedPlayer(playerData);
        setIsModalOpen(true);
    };

    const filter = (player) => {
        const normalizeString = (str) =>
            str
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();

        const searchNormalized = normalizeString(searchTerm);
        return (
            normalizeString(player.name).includes(searchNormalized) ||
            normalizeString(player.position).includes(searchNormalized) ||
            (player.marketValue &&
                normalizeString(player.marketValue.toString()).includes(
                    searchNormalized
                ))
        );
    };

    const filtered = clubs.filter(filter);

    return (
        <div className="container mt-5">
            <Navbar/>
            <div className="row mb-3 justify-content-center">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control search-input"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="ag-theme-alpine" style={{height: 600, width: '100%', marginTop: '20px'}}>
                {isLoading ? (
                    <div className="text-center">
                        <span className="spinner-custom" role="status">⚽</span>
                    </div>

                ) : (
                    <AgGridReact
                        rowData={filtered}
                        columnDefs={columnDefs}
                        domLayout='autoHeight'
                        pagination={true}
                        paginationPageSize={10}
                        onRowClicked={handleRowClick} // Add this line
                    ></AgGridReact>
                )}
            </div>
            {isModalOpen && (
                <div className="modal" style={{display: isModalOpen ? 'block' : 'none'}} tabIndex="-1"
                     onClick={() => setIsModalOpen(false)}>
                    <div className="modal-dialog">
                        <div className="fut-modal-background" style={{backgroundImage: `url(${futImage})`}}>
                            <div className="modal-body">
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clubs;
