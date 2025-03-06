/* eslint-disable react/prop-types */
import { PDFViewer } from "@react-pdf/renderer";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { Font } from "@react-pdf/renderer";
import RobotoRegular from "../../../../../fonts/Roboto-Regular.ttf";
import RobotoBold from "../../../../../fonts/Roboto-Bold.ttf";

const worksData = [
  { no: 1, name: "Замена электрода розжига и ионизации", cost: "1 500,00" },
  { no: 2, name: "Замена датчика температуры", cost: "1 500,00" },
  { no: 3, name: "Замена датчика давления воды", cost: "1 500,00" },
  { no: 4, name: "Замена реле давления воды", cost: "1 500,00" },
  { no: 5, name: "Замена платы ввода питания", cost: "1 500,00" },
  {
    no: 6,
    name: "Замена панели управления/контроллера горения",
    cost: "1 700,00",
  },
  { no: 7, name: "Замена горелочного узла в сборе", cost: "2 000,00" },
  { no: 8, name: "Замена горелочной трубы", cost: "2 000,00" },
  { no: 9, name: "Замена газового клапана", cost: "2 000,00" },
  { no: 10, name: "Замена вентилятора", cost: "2 000,00" },
  { no: 11, name: "Замена смесителя газового", cost: "2 000,00" },
  { no: 12, name: "Замена теплоизоляции", cost: "2 500,00" },
  { no: 13, name: "Замена теплообменника GEFFEN МВ 4.1", cost: "3 500,00" },
  { no: 14, name: "Замена котла", cost: "2 000,00" },
  { no: 15, name: "Выезд на объект в черте города", cost: "500,00" },
  { no: 16, name: "Выезд на объект за чертой города", cost: "20 руб./км" },
  { no: 17, name: "Первый запуск котла GEFFEN МВ 4.1", cost: "1 500,00" },
  {
    no: 18,
    name: "Первый запуск котла GEFFEN МВ 3.1 127, 145, 200, 251, 301",
    cost: "2 500,00",
  },
];
const MyTable = ({ data }) => (
  <View style={styles.table}>
    {/* Заголовок таблицы */}
    <View style={styles.tableRow}>
      <Text style={styles.tableColHeader}>№ п/п</Text>
      <Text style={styles.tableColHeader}>Наименование работ</Text>
      <Text style={styles.tableColHeader}>Стоимость</Text>
    </View>

    {/* Динамическое заполнение строк */}
    {data.map((item, index) => (
      <View style={styles.tableRow} key={index}>
        <Text style={styles.tableCol}>{index + 1}</Text>
        <Text style={styles.tableCol}>{item.name}</Text>
        <Text style={styles.tableCol}>{item.cost} ₽</Text>
      </View>
    ))}
  </View>
);

export default function Test() {
  return (
    <>
      <PDFViewer style={{ width: "100%", height: "100%" }}>
        <Document>
          <Page
            size="A4"
            style={{ padding: 20, fontFamily: "Roboto", fontSize: 10 }}
          >
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              Отчёт по работам
            </Text>
            <MyTable data={worksData} />
          </Page>
        </Document>
      </PDFViewer>
    </>
  );
}

const styles = StyleSheet.create({
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "33.33%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    backgroundColor: "#f2f2f2",
    padding: 5,
    fontWeight: "bold",
  },
  tableCol: {
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
});

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: RobotoRegular,
      fontWeight: "normal",
    },
    {
      src: RobotoBold,
      fontWeight: "bold",
    },
  ],
});
