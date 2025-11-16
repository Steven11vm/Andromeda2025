import React from 'react';
import Button from '@mui/material/Button';
import { FaAngleRight } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";



const Pagination = ({ nPages, currentPages, setCurrentPages }) => {

    const Next = () => {
        if (currentPages !== nPages) setCurrentPages(currentPages + 1);
    };

    const End = () => {
        if (currentPages !== nPages) setCurrentPages(currentPages === nPages);
    };

    const Start = () => {
        if (currentPages !== nPages) setCurrentPages(currentPages === 1);
    };

    const Prev = () => {
        if (currentPages !== 1) setCurrentPages(currentPages - 1);
    };

    const selectPage = (page) => {
        setCurrentPages(page);
    };

    return (
        <>
            <div className='w-100 d-flex align-items-center justify-content-end'>
                <nav aria-label="Page navigation example">
                    <ul className="pagination">
                        <li className={`page-item ${currentPages === 1 ? 'disabled' : ''}`}>
                            <a className="page-link" href="#" aria-label="Previous" onClick={Prev}>
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                        {[...Array(nPages)].map((_, i) => (
                            <li key={i} className={`page-item ${currentPages === i + 1 ? 'active' : ''}`}>
                                <a
                                    className="page-link"
                                    href="#"
                                    onClick={() => selectPage(i + 1)}
                                >
                                    {i + 1}
                                </a>
                            </li>
                        ))}
                        <li className={`page-item ${currentPages === nPages ? 'disabled' : ''}`}>
                            <a className="page-link" href="#" aria-label="Next" onClick={Next}>
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default Pagination;
