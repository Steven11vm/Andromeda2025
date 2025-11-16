import React from "react";
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import axios from "axios";

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    header: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
        color: '#4A4A4A',
        textTransform: 'uppercase',
    },
    infoContainer: {
        flexDirection: 'row',
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
        color: '#888888',
    },
    value: {
        fontSize: 10,
        color: '#333333',
    },
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginTop: 10,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    tableCell: {
        margin: 'auto',
        marginTop: 3,
        marginBottom: 3,
        fontSize: 8,
    },
    total: {
        marginTop: 10,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        fontSize: 6,
        color: '#888888',
        textAlign: 'center',
    },
});

const ViewShopping = ({ shopping, suppliers, products }) => {
  const NameProduct = (productId) => {
    if (!products) return 'Producto Desconocido'; // Asegúrate de que products esté definido
    const product = products.find(product => product.id === productId);
    return product ? product.Product_Name : 'Producto Desconocido';
};


  const supplierName = (supplierId) => {
    if (!suppliers) return 'Desconocido'; // Asegúrate de que suppliers esté definido
    const supplier = suppliers.find(supplier => supplier.id === supplierId);
    return supplier ? supplier.Supplier_Name : 'Desconocido';
};


  return (
     <Document>
            <Page size="A6" style={styles.page}>
                <Text style={styles.header}>Comprobante #{shopping.code}</Text>

                <View style={styles.infoContainer}>
                    <View style={styles.infoColumn}>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Fecha de Compra</Text>
                            <Text style={styles.value}>{new Date(shopping.purchaseDate).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Estado</Text>
                            <Text style={styles.value}>{shopping.status}</Text>
                        </View>
                    </View>
                    <View style={styles.infoColumn}>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Proveedor</Text>
                            <Text style={styles.value}>{supplierName(shopping.supplierId)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Fecha de Registro</Text>
                            <Text style={styles.value}>
                                {shopping.registrationDate ? new Date(shopping.registrationDate).toLocaleDateString() : 'No registrada'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={[styles.tableRow, { backgroundColor: '#F0F0F0' }]}>
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
                    {shopping.ShoppingDetails.map((detail, index) => (
                        <View key={index} style={styles.tableRow}>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{NameProduct(detail.product_id)}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{detail.quantity}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>${detail.unitPrice.toLocaleString()}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>${detail.total_price.toLocaleString()}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <Text style={styles.total}>
                    Total: ${shopping.total_price.toLocaleString()}
                </Text>

                <Text style={styles.footer}>
                    Creado: {new Date(shopping.createdAt).toLocaleString()} |
                    Actualizado: {new Date(shopping.updatedAt).toLocaleString()}
                </Text>
            </Page>
        </Document>
    );
};

export default ViewShopping;