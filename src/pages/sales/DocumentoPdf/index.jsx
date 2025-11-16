import React, { useState, useEffect } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import axios from "axios";

const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        padding: 20,
    },
    header: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: "center",
        color: "#4A4A4A",
        textTransform: "uppercase",
    },
    infoContainer: {
        flexDirection: "row",
        marginBottom: 10,
    },
    infoColumn: {
        flex: 1,
    },
    infoItem: {
        marginBottom: 5,
    },
    label: {
        fontSize: 8,
        color: "#888888",
    },
    value: {
        fontSize: 10,
        color: "#333333",
    },
    table: {
        display: "table",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginTop: 10,
    },
    tableRow: {
        margin: "auto",
        flexDirection: "row",
    },
    tableCol: {
        width: "25%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    tableCell: {
        margin: "auto",
        marginTop: 3,
        marginBottom: 3,
        fontSize: 8,
    },
    total: {
        marginTop: 10,
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "right",
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        fontSize: 6,
        color: "#888888",
        textAlign: "center",
    },
    sectionHeader: {
        marginTop: 10,
        fontSize: 12,
        fontWeight: "bold",
    },
});

const DocumentPdf = ({ sale }) => {
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [users, setUsers] = useState([]);
    const [appointment, setAppointment] = useState(null);
    const urlUsers = 'https://andromeda-api.onrender.com/api/users'

    useEffect(() => {
        getProducts();
        getServices();
        getUsers();

        // Filtrar los detalles para identificar servicios con citas asociadas
        const hasServiceWithAppointment = sale.SaleDetails.some(
            (detail) => detail.serviceId && detail.appointmentId
        );

        if (hasServiceWithAppointment) {
            const appointmentId = sale.SaleDetails.find(
                (detail) => detail.appointmentId
            )?.appointmentId;
            if (appointmentId) {
                getAppointment(appointmentId);
            }
        }
    }, [sale]);

    const getUsers = async () => {
        const response = await axios.get(urlUsers)
        setUsers(response.data)
    }

    const getProducts = async () => {
        try {
            const response = await axios.get("https://andromeda-api.onrender.com/api/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const getServices = async () => {
        try {
            const response = await axios.get("https://andromeda-api.onrender.com/api/services");
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    const getAppointment = async (appointmentId) => {
        try {
            const response = await axios.get(
                `https://andromeda-api.onrender.com/api/appointment/${appointmentId}`
            );
            setAppointment(response.data);
        } catch (error) {
            console.error("Error fetching appointment:", error);
        }
    };

    const NameProduct = (productId) => {
        const product = products.find((product) => product.id === productId);
        return product ? product.Product_Name : "Producto desconocido";
    };

    const NameService = (serviceId) => {
        const service = services.find((service) => service.id === serviceId);
        return service ? service.name : "Servicio desconocido";
    };

    const userName = (userId) => {
        const user = users.find(user => user.id === userId)
        return user ? user.name : 'Desconocido'
    }

    const productDetails = sale.SaleDetails.filter((detail) => detail.id_producto);
    const serviceDetails = sale.SaleDetails.filter((detail) => detail.serviceId);

    return (
        <Document>
            <Page size="A6" style={styles.page}>
                <Text style={styles.header}>Comprobante{sale.Billnumber}</Text>

                <View style={styles.infoContainer}>
                    <View style={styles.infoColumn}>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Fecha de Venta</Text>
                            <Text style={styles.value}>
                                {new Date(sale.SaleDate).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Estado</Text>
                            <Text style={styles.value}>{sale.status}</Text>
                        </View>
                    </View>
                    <View style={styles.infoColumn}>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Cliente</Text>
                            <Text style={styles.value}>{userName(sale.id_usuario)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Fecha de Registro</Text>
                            <Text style={styles.value}>
                                {sale.registrationDate ? new Date(sale.registrationDate).toLocaleDateString() : 'No registrada'}
                            </Text>
                        </View>
                    </View>
                </View>

                {productDetails.length > 0 && (
                    <>
                        <Text style={styles.sectionHeader}>Productos</Text>
                        <View style={styles.table}>
                            <View
                                style={[styles.tableRow, { backgroundColor: "#F0F0F0" }]}
                            >
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>Producto</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>Cantidad</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>Precio Unit.</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>Total</Text>
                                </View>
                            </View>
                            {productDetails.map((detail, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {NameProduct(detail.id_producto)}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {detail.quantity}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            ${detail.unitPrice.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            ${detail.total_price.toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {appointment && appointment.Date && (
                    <>
                        <Text style={styles.sectionHeader}>Cita</Text>
                        <View style={styles.infoContainer}>
                            <View style={styles.infoColumn}>
                                <Text style={styles.label}>Fecha</Text>
                                <Text style={styles.value}>
                                    {new Date(appointment.Date).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.infoColumn}>
                                <Text style={styles.label}>Hora Inicio</Text>
                                <Text style={styles.value}>{appointment.Init_Time}</Text>
                            </View>
                            <View style={styles.infoColumn}>
                                <Text style={styles.label}>Hora Fin</Text>
                                <Text style={styles.value}>{appointment.Finish_Time}</Text>
                            </View>
                        </View>
                    </>
                )}

                {serviceDetails.length > 0 && (
                    <>
                        <Text style={styles.sectionHeader}>Servicios</Text>
                        <View style={styles.table}>
                            <View
                                style={[styles.tableRow, { backgroundColor: "#F0F0F0" }]}
                            >
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>Servicio</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>Cantidad</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>Precio Unit.</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>Total</Text>
                                </View>
                            </View>
                            {serviceDetails.map((detail, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {NameService(detail.serviceId)}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {detail.quantity}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            ${detail.unitPrice.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            ${detail.total_price.toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </Page>
        </Document>
    );
};

export default DocumentPdf;
