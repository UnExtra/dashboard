import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core styles
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Theme
import {getAllClubs, getPlayers} from '../api';
import Navbar from './Navbar';
import futImage from '../fut.png'; // Adjust the path as necessary
import { useNavigate } from 'react-router-dom';

const Clubs = () => {
    const [clubs, setClubs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();


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
        { field: 'name', sortable: true, filter: true, headerName: 'Club Name' },
        { field: 'stadium_name', headerName: 'Stadium Name', sortable: true, filter: true },
        { field: 'stadium_seat', headerName: 'Stadium Seats', sortable: true, filter: true },
        { field: 'avgmarketvalue', headerName: 'Avg Market Value', sortable: true, filter: true,
            valueFormatter: params => {
                return new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0
                }).format(Math.round(params.value));
            }
        },
        { field: 'totalplayers', headerName: 'Total Players', sortable: true, filter: true },
        { field: 'forwards', headerName: 'Forwards', sortable: true, filter: true },
        { field: 'midfields', headerName: 'Midfields', sortable: true, filter: true },
        { field: 'backs', headerName: 'Backs', sortable: true, filter: true },
        { field: 'goalkeepers', headerName: 'Goalkeepers', sortable: true, filter: true },
    ];


    const handleRowClick = (event) => {
        navigate(`/club/${event.data.id}`, { state: { club: event.data } });
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
            normalizeString(player.stadium_name).includes(searchNormalized)
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
        </div>
    );
};

export default Clubs;
