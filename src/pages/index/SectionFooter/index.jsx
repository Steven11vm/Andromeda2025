import React from 'react';
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { IoTimeOutline } from "react-icons/io5";
import { SiGmail } from "react-icons/si";
import { Scissors } from "lucide-react";

const SectionFooter = () => {
    return (
        <footer className="content-footer">
            <style jsx>{`
                .content-footer {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    padding: 60px 20px 30px;
                    position: relative;
                    overflow: hidden;
                }
                
                .scissors-decoration {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 0.1;
                    color: #c59d5f;
                    z-index: 0;
                }
                
                .scissors-left {
                    left: 5%;
                    animation: rotateScissors 8s ease-in-out infinite;
                }
                
                .scissors-right {
                    right: 5%;
                    animation: rotateScissors 8s ease-in-out infinite reverse;
                }
                
                @keyframes rotateScissors {
                    0%, 100% {
                        transform: translateY(-50%) rotate(0deg) scale(1);
                    }
                    25% {
                        transform: translateY(-50%) rotate(15deg) scale(1.1);
                    }
                    50% {
                        transform: translateY(-50%) rotate(0deg) scale(1);
                    }
                    75% {
                        transform: translateY(-50%) rotate(-15deg) scale(1.1);
                    }
                }
                
                .footer-content {
                    position: relative;
                    z-index: 1;
                }
                
                .footer-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 40px;
                    margin-bottom: 40px;
                }
                
                .footer-column {
                    text-align: center;
                    color: #fff;
                    transition: transform 0.3s ease;
                }
                
                .footer-column:hover {
                    transform: translateY(-5px);
                }
                
                .title-footer {
                    font-size: 1.4rem;
                    margin-bottom: 20px;
                    color: #c59d5f;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    position: relative;
                    display: inline-block;
                }
                
                .title-footer::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 50px;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, #c59d5f, transparent);
                    animation: expandLine 2s ease-in-out infinite;
                }
                
                @keyframes expandLine {
                    0%, 100% {
                        width: 50px;
                    }
                    50% {
                        width: 80px;
                    }
                }
                
                .footer-info {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .footer-info span {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    color: #e0e0e0;
                    font-size: 1rem;
                    transition: color 0.3s ease;
                }
                
                .footer-info span:hover {
                    color: #c59d5f;
                }
                
                .footer-info span svg {
                    color: #c59d5f;
                    font-size: 1.2rem;
                    animation: pulseIcon 2s ease-in-out infinite;
                }
                
                @keyframes pulseIcon {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }
                
                .social-icons {
                    display: flex;
                    justify-content: center;
                    gap: 25px;
                    margin-top: 40px;
                    padding-top: 30px;
                    border-top: 1px solid rgba(197, 157, 95, 0.2);
                }
                
                .social-icons a {
                    color: #c59d5f;
                    font-size: 1.8rem;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(197, 157, 95, 0.1);
                    border: 2px solid rgba(197, 157, 95, 0.3);
                }
                
                .social-icons a:hover {
                    color: #fff;
                    background: #c59d5f;
                    transform: translateY(-5px) rotate(5deg);
                    box-shadow: 0 10px 20px rgba(197, 157, 95, 0.4);
                }
                
                .footer-email {
                    text-align: center;
                    margin-top: 20px;
                    color: #c59d5f;
                    font-size: 1rem;
                    font-weight: 500;
                    letter-spacing: 1px;
                }
                
                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: 1fr;
                        gap: 30px;
                    }
                    
                    .scissors-decoration {
                        display: none;
                    }
                    
                    .content-footer {
                        padding: 40px 20px 20px;
                    }
                }
            `}</style>
            <div className="scissors-decoration scissors-left">
                <Scissors size={120} strokeWidth={1.5} />
            </div>
            <div className="scissors-decoration scissors-right">
                <Scissors size={120} strokeWidth={1.5} />
            </div>
            <div className="footer-content">
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
            <div className="footer-email">
                barberiaOrion2@gmail.com
            </div>
            </div>
        </footer>
    );
}

export default SectionFooter;

