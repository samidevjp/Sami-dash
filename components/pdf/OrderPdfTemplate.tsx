// @ts-nocheck
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: 'white'
  },
  header: {
    marginBottom: 20
  },
  logo: {
    width: 150,
    marginBottom: 10
  },
  contact: {
    fontSize: 12,
    marginBottom: 10
  },
  invoiceInfo: {
    position: 'absolute',
    top: 30,
    right: 30,
    fontSize: 12
  },
  description: {
    marginTop: 30,
    borderBottom: 1,
    paddingBottom: 10
  },
  allergyWarning: {
    marginTop: 20,
    backgroundColor: 'red',
    color: 'white',
    padding: 5,
    textAlign: 'center'
  },
  paidStatus: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    color: 'red',
    fontSize: 12
  }
});

const OrderPdfTemplate = ({ order }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <View style={styles.header}>
        <Text>VANILLA</Text>
        <Text style={styles.contact}>Nicole - 0416 211 263</Text>
      </View>

      <View style={styles.invoiceInfo}>
        <Text>INVOICE #{order.id}</Text>
        <Text>Pick up Date:</Text>
        <Text>{order.pickup_date}</Text>
        <Text>{order.pickup_time}</Text>
      </View>

      <View style={styles.description}>
        <Text>DESCRIPTION</Text>
        {order.products.map((product, index) => (
          <Text key={index}>{product.name}</Text>
        ))}
      </View>

      {order.allergy_warning && (
        <View style={styles.allergyWarning}>
          <Text>NUT ALLERGY</Text>
        </View>
      )}

      {order.paid && <Text style={styles.paidStatus}>PAID IN FULL</Text>}
    </Page>
  </Document>
);

export default OrderPdfTemplate;
