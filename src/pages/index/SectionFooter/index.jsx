import React from 'react';
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { IoTimeOutline } from "react-icons/io5";
import { SiGmail } from "react-icons/si";

const SectionFooter = () => {
    return (
        <footer className="content-footer">
            <style jsx>{`
                .content-footer {
                    background-color: #f5f5f5;
                    padding: 20px;
                }
                .footer-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }
                .footer-column {
                    text-align: center;
                }
                .title-footer {
                    font-size: 1.2rem;
                    margin-bottom: 15px;
                }
                .footer-info {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .footer-info span {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                }
                .social-icons {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 20px;
                }
                .social-icons a {
                    color: #333;
                    font-size: 1.5rem;
                }
                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
            <div className="footer-grid">
                <div className="footer-column">
                    <h4 className="title-footer">Contáctenos</h4>
                    <div className="footer-info">
                        <span><FaWhatsapp /> Whatsapp: 3143161922</span>
                    </div>
                </div>
                <div className="footer-column">
                    <h4 className="title-footer">Visítanos</h4>
                    <div className="footer-info">
                        <span><LuMapPin /> Calle 80 #80-45</span>
                        <span>Medellín, Antioquia</span>
                    </div>
                </div>
                <div className="footer-column">
                    <h4 className="title-footer">Horas</h4>
                    <div className="footer-info">
                        <span><IoTimeOutline />Lunes a Domingo: 7am - 9:15pm</span>
                        <span>Lunes: Cerrado</span>
                    </div>
                </div>
            </div>
            <div className="social-icons">
                <a href="#" aria-label="Facebook"><FaFacebook /></a>
                <a href="#" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" aria-label="Gmail"><SiGmail /></a>
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <span>barberiaOrion2@gmail.com</span>
            </div>
        </footer>
    );
}

export default SectionFooter;

