/* eslint-disable react/prop-types */
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { PDFViewer } from "@react-pdf/renderer";
import { Font } from "@react-pdf/renderer";
import RobotoRegular from "../../../../../fonts/Roboto-Regular.ttf";
import RobotoBold from "../../../../../fonts/Roboto-Bold.ttf";
import RobotoItalic from "../../../../../fonts/Roboto-Italic.ttf";
import { LoadingSpinner } from "./../../../../LoadingSpinner/LoadingSpinner";
import { useEffect, useState } from "react";
import $api from "../../../../../http";
import region_data from "../../../../WorkerPanel/DataBaseUsers/russian_regions_codes.json";
import petrovich from "petrovich";
import { jwtDecode } from "jwt-decode";

Font.registerHyphenationCallback((word) => ["", word, ""]);
const monthGenitive = {
  январь: "января",
  февраль: "февраля",
  март: "марта",
  апрель: "апреля",
  май: "мая",
  июнь: "июня",
  июль: "июля",
  август: "августа",
  сентябрь: "сентября",
  октябрь: "октября",
  ноябрь: "ноября",
  декабрь: "декабря",
};

const date = new Date();
const day = date.getDate();
const year = date.getFullYear();
const monthName = date.toLocaleString("ru", { month: "long" });
const formattedDate = `«${day}» ${monthGenitive[monthName]} ${year} г.`;

export default function WorkerContract() {
  const [isLoading, setIsLoading] = useState(true);
  function handleOnLoad() {
    setIsLoading(false);
  }
  const [data, setData] = useState();
  const [dataPrices, setDataPrices] = useState();
  const token =
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken");

  useEffect(() => {
    $api
      .get(`/getWorkerInfo`)
      .then((result) => {
        setData(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    $api
      .get(`/getServicePrices/${jwtDecode(token).login}`)
      .then((result) => {
        setDataPrices(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div
        className="container"
        style={{ overflow: "hidden", height: "100dvh" }}
      >
        <PDFViewer style={{ width: "100%", height: "100%", border: 0 }}>
          <MyDocument
            data={data}
            dataPrices={dataPrices}
            handleOnLoad={handleOnLoad}
          />
        </PDFViewer>
      </div>
    </>
  );
}

export const MyDocument = ({ data, dataPrices, handleOnLoad }) => {
  let declinedPerson = "";
  const arr_fio = data?.full_name?.split(" ");
  if (data?.full_name) {
    const person = {
      first: arr_fio[1],
      middle: arr_fio[2],
      last: arr_fio[0],
    };
    declinedPerson = petrovich(person, "genitive");
  }

  return (
    <Document onRender={handleOnLoad}>
      <Page size="A4" style={styles.page}>
        {/* Заголовок документа */}
        <Text style={styles.title}>
          ДОГОВОР НА ВЫПОЛНЕНИЕ РАБОТ И ОКАЗАНИЕ УСЛУГ ПО ГАРАНТИЙНОМУ И
          ПОСТГАРАНТИЙНОМУ РЕМОНТУ № {data?.contract_number}-АСЦ
        </Text>
        {/* город и дата */}
        <View style={styles.subHeader}>
          <Text style={styles.city}>г. Тула</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        {/* Основной текст */}
        <Text
          style={[
            styles.paragraph,
            styles.paragraphNoMargin,
            { marginTop: 10 },
          ]}
        >
          Настоящий Договор (далее именуемый «Договор») заключен между компанией
          ООО «ГЕФФЕН» в лице Директора Орехова Алексея Сергеевича, действующего
          на основании Устава и именуемое в дальнейшем как «Заказчик», и
          компанией {data?.company_name} в лице{" "}
          {data?.genitive_postion.charAt(0).toUpperCase() +
            data?.genitive_postion.slice(1).toLowerCase()}{" "}
          {declinedPerson.last +
            " " +
            declinedPerson.first +
            " " +
            declinedPerson.middle}
          , действующего на основании Устава и именуемое в дальнейшем как
          «Исполнитель».
        </Text>
        <Text style={[styles.paragraph, styles.paragraphNoMargin]}>
          Далее по тексту договора вышеуказанные компании совместно именуются
          как «Стороны», а по отдельности – «Сторона».
        </Text>
        {/* 1. ПРЕДМЕТ ДОГОВОРА */}
        <Text style={[styles.sectionTitle, { textAlign: "center" }]}>
          1. ПРЕДМЕТ ДОГОВОРА
        </Text>
        <Text style={styles.paragraph}>
          1.1. Заказчик поручает, а Исполнитель принимает на себя обязательство
          выполнять работы по гарантийному и постагарантийному ремонту (далее –
          «Работы») котлов под брендом GEFFEN, перечисленных в Приложении №1
          (далее «Продукция») вне зависимости от места их приобретения
          потребителем.
        </Text>
        <Text style={styles.paragraph}>
          1.2. Исполнитель обязуется выполнять Работы своими силами и не вправе
          привлекать к выполнению Работ третьих лиц, за исключением случаев,
          предварительно согласованных с Заказчиком.
        </Text>
        <Text style={styles.paragraph}>
          Во исполнение данной обязанности Исполнителю придается статус
          Авторизованный сервисный центр (АСЦ) Продукции GEFFEN.
        </Text>
        <Text style={styles.paragraph}>
          Исполнитель имеет право именовать себя «Сервисный центр GEFFEN», а
          также давать соответствующую рекламу. Недопустимо использовать марку
          GEFFEN в качестве составной части названия Исполнителя.
        </Text>
        <Text style={styles.paragraph}>
          1.3. Работы выполняются Исполнителем без взимания платы с
          потребителей, обратившихся к Исполнителю с обращением или требованием
          о выполнении гарантийного ремонта Продукции.
        </Text>
        <Text style={styles.paragraph}>
          1.4. Исполнитель вправе отказаться от выполнения работ,
          классифицированных как не гарантийные. В случае выполнения не
          гарантийных работ, оплата их стоимости и оплата стоимости запасных
          частей использованных для ремонта Продукции взимается с потребителей,
          обратившихся к Исполнителю.
        </Text>
        <Text style={styles.paragraph}>
          1.5. Исполнитель выполняет Работы в отношении Продукции, установленной
          (введенной в эксплуатацию) на территории{" "}
          {
            region_data.filter((item) => item.code === data?.region)[0]
              ?.namecase_genitive
          }
          .
        </Text>
        {/* 2. ОБЯЗАННОСТИ ИСПОЛНИТЕЛЯ */}
        <Text style={styles.sectionTitle}>2. ОБЯЗАННОСТИ ИСПОЛНИТЕЛЯ</Text>
        <Text style={styles.paragraph}>
          2.1 При обращении потребителя к Исполнителю для выполнения Работ по
          гарантийному ремонту, Исполнитель обязан руководствоваться правилами и
          условиями предоставления гарантии на Продукцию, установленными
          Заказчиком.
        </Text>
        <Text style={styles.paragraph}>
          Информация об этом содержится в паспорте котла, передаваемом
          потребителю при продаже ему Продукции. В паспорте котла также указан
          гарантийный срок, в течение которого могут выполняться гарантийные
          Работы.
        </Text>
        <Text style={styles.paragraph}>
          2.2. При обращении Потребителя к Исполнителю с требованием о
          проведении гарантийного ремонта и наличия соответствующих оснований,
          Исполнитель обязуется выполнить комплекс Работ по гарантийному ремонту
          Продукции.
        </Text>
        <Text style={styles.paragraph}>
          2.3. В случае возникновения у Исполнителя вопросов/сомнений по поводу
          классификации случая как гарантийного, Исполнитель обязан обратиться к
          Заказчику за разъяснениями.
        </Text>
        <Text style={styles.paragraph}>
          2.4. Исполнитель обязуется в каждом случае проверять наличие оснований
          для выполнения Работ. Основания для выполнения Работ должны
          признаваться отсутствующими, в частности, в следующих случаях:
        </Text>
        {/* Список с тире */}
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>
            - у потребителя отсутствует паспорт котла;
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>
            - в паспорте котла отсутствуют надлежащим образом заполненные
            отметки о продаже и вводе в эксплуатацию Продукции;
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>
            - недостатки, дефекты или неисправность Продукции возникли в
            результате нарушения потребителем правил установки или эксплуатации
            Продукции;
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>
            - недостатки, дефекты или неисправность Продукции возникли в
            результате действий потребителя, третьих лиц или обстоятельств
            непреодолимой силы.
          </Text>
        </View>
        {/* НОВЫЕ ПУНКТЫ (2.5 – 2.13) */}
        <Text style={styles.paragraph}>
          2.5. Исполнитель действует как самостоятельный хозяйствующий субъект и
          должен иметь необходимые для выполнения Работ транспортные средства,
          оборудование и инструмент. Заказчик не возмещает Исполнителю стоимость
          расходов на приобретение или аренду оборудования и инструментов.
        </Text>
        <Text style={styles.paragraph}>
          2.6. Исполнитель должен соответствовать требованиям, предъявляемым
          законодательством Российской Федерации к организациям, осуществляющим
          работы по техническому обслуживанию и ремонту газового оборудования,
          включая получение в установленном порядке допуски к выполнению работ
          (оказанию услуг) по техническому обслуживанию и ремонту внутридомового
          и внутриквартирного газового оборудования.
        </Text>
        <Text style={styles.paragraph}>
          2.7. Специалисты Исполнителя, допущенные им к выполнению Работ, должны
          соответствовать всем предъявляемым законодательством Российской
          Федерации требованиям, в том числе, иметь соответствующую
          профессиональную подготовку согласно требованиям законодательства
          Российской Федерации, иметь установленные законодательством документы
          на право выполнения работ по монтажу, пусконаладке и обслуживанию
          газового оборудования.
        </Text>
        <Text style={styles.paragraph}>
          2.8. Специалисты Исполнителя, осуществляющие Работы, должны иметь
          действующий сертификат, выданный Заказчиком в ходе обучения по ремонту
          и обслуживанию Продукции.
        </Text>
        <Text style={styles.paragraph}>
          2.9. Исполнитель обязан в течение 24 часов с момента обращения
          потребителя отреагировать и приступить к устранению недостатка или
          неисправности продукции. Работы должны выполняться в месте установки
          Продукции посредством выезда к потребителю.
        </Text>
        <Text style={styles.paragraph}>2.10. Исполнитель также обязан:</Text>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>
            - вести регистрацию и учет документов, подтверждающих обращения
            потребителей, включая, среди прочего, любые запросы и претензии в
            соответствии с действующим законодательством Российской Федерации, а
            также по требованию Заказчика незамедлительно направлять ему копии
            таких запросов и претензий;
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>
            - незамедлительно информировать Заказчика и просить его содействия,
            если ремонт Продукции по гарантии не может быть выполнен
            своевременно или не может быть выполнен удовлетворительно для
            потребителя;
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>
            - вести учет и хранение документации по Работам, выполненным в
            рамках данного Договора.
          </Text>
        </View>
        <Text style={styles.paragraph}>
          2.11. Работы по сервисному обслуживанию оборудования не являются
          гарантийными и не подлежат оплате за счет Заказчика.
        </Text>
        <Text style={styles.paragraph}>
          2.12. Постгарантийный ремонт производится по расценкам, утвержденным
          АСЦ самостоятельно и не подлежит оплате Заказчиком. Размер скидки на
          запасные части, необходимые для проведения данных работ, остается
          неизменным.
        </Text>
        <Text style={styles.paragraph}>
          2.13. Выезд на объект по ложному вызову не является ответственностью
          Заказчика и не подлежит оплате с его стороны.
        </Text>
        {/* 3. ЗАПАСНЫЕ ЧАСТИ */}
        <Text style={styles.sectionTitle}>3. ЗАПАСНЫЕ ЧАСТИ</Text>
        <Text style={styles.paragraph}>
          3.1. При выполнении Работ Исполнитель обязан использовать только новые
          оригинальные запасные части поставляемые Заказчиком.
        </Text>
        <Text style={styles.paragraph}>
          Исполнитель не вправе использовать и предлагать при ремонте Продукции
          какие-либо иные запасные части других производителей.
        </Text>
        <Text style={styles.paragraph}>
          3.2. В течение всего срока действия настоящего Договора Заказчик
          предоставляет Исполнителю скидку на приобретение запасных частей в
          размере 30%.{"\n"}
          Запасные части приобретаются Исполнителем у Заказчика.
        </Text>
        <Text style={styles.paragraph}>
          3.3. В течение всего срока действия настоящего Договора Исполнитель
          обязан хранить на своем складе резерв запасных частей для выполнения
          Работ, перечень которых определен Приложением №3 к настоящему
          договору. Резерв запасных частей Заказчик передает Исполнителю на
          условиях ответственного хранения.
        </Text>
        <Text style={styles.paragraph}>
          3.4. Израсходованные в ходе ремонта запасные части, переданные
          Заказчиком на условиях ответственного хранения, Исполнитель должен
          восполнять путем их покупки у Заказчика
        </Text>
        <Text style={styles.paragraph}>
          3.5. Исполнитель обязан передавать вышедшие из строя запасные части, в
          течение 10 (Десяти) рабочих дней со дня проведения их замены Заказчику
          за счет Заказчика.
        </Text>
        <Text style={styles.sectionTitle}>
          4. СТОИМОСТЬ РАБОТ И ПОРЯДОК ЕЕ ВОЗМЕЩЕНИЯ
        </Text>
        <Text style={styles.paragraph}>
          4.1. Заказчик обязуется возмещать Исполнителю стоимость выполненных
          гарантийных Работ и использованных для их выполнения запасных частей в
          порядке и на условиях, установленных настоящим Договором.
        </Text>
        <Text style={styles.paragraph}>
          4.2. Стоимость Работ определяется в соответствии с Приложением № 2 к
          настоящему Договору.
        </Text>
        <Text style={styles.paragraph}>
          4.3. Возмещаемая Заказчиком стоимость запасных частей определяется как
          стоимость запасных частей по рекомендованному розничному прайс-листу
          на дату их приобретения, за вычетом скидки, указанной в п. 3.2
          настоящего договора.
        </Text>
        <Text style={styles.paragraph}>
          В случае приобретения Исполнителем запасных частей у третьих лиц,
          уполномоченных на продажу товаров и оборудования на территории РФ,
          стоимость определяется следующим образом:
        </Text>
        <Text style={styles.paragraph}>
          от действующего на дату предоставления гарантийной отчетности
          рекомендованного розничного прайс-листа Заказчика вычитается скидка в
          соответствии с п. 3.2.
        </Text>
        <Text style={styles.paragraph}>
          В случае, если стоимость приобретенных запасных частей с учетом скидки
          у третьих лиц, уполномоченных Заказчиком на продажу товаров и
          оборудования в РФ, превышает возмещаемую Заказчиком стоимость, такие
          отклонения не подлежат возмещению.
        </Text>
        <Text style={styles.paragraph}>
          4.4. Заказчик вправе в любое время изменять скидку на запчасти,
          указанную в п. 3.2 настоящего Договора и вносить изменения в Базовый
          прайс-лист на запчасти. Базовый прайс-лист с актуальными ценами
          направляется Исполнителю электронной почтой по предварительному
          запросу. Сторонами согласовано, что направляемые Заказчиком в этом
          случае электронные письма (письма по электронной почте) приравниваются
          к изменениям, совершенным Сторонами в письменной форме, и имеют
          обязательную для Сторон юридическую силу.
        </Text>
        <Text style={styles.paragraph}>
          4.5. По итогам выполнения работ по гарантийному ремонту оборудования
          Исполнитель информирует Заказчика о выполненных работах. Заказчик в
          течение 5 рабочих дней принимает решение об одобрении этих работ или
          об отказе в их одобрении в полном объеме. Заказчик вправе отказать в
          одобрении работ, если они выполнены с недостатками по качеству или при
          отсутствии оснований для их выполнения.
        </Text>
        <Text style={styles.paragraph}>
          4.6. На основании решения с одобрением Работ, Исполнитель составляет и
          направляет Заказчику следующие документы:
        </Text>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>
            - два экземпляра акта выполненных Работ, подписанных уполномоченным
            должностным лицом Исполнителя, с отражением в них стоимости Работ и
            запасных частей в рублях;
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>
            - счет-фактуру на стоимость Работ и запасных частей (если требуется
            Исполнителю):
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>- отчет о ремонте;</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>- рекламацию.</Text>
        </View>
        <Text style={styles.paragraph}>
          Стоимость Работ и запасных частей определяются Заказчиком и
          Исполнителем в указанных документах в рублях.
        </Text>
        <Text style={styles.paragraph}>
          4.7. Заказчик производит оплату возмещения стоимости Работ и
          использованных для их выполнения запасных частей согласно Акту
          выполненных работ в течение 14 календарных дней со дня получения
          Заказчиком от Исполнителя надлежащим образом оформленных и
          составленных с соблюдением требований настоящего Договора и
          законодательства Российской Федерации Акта выполненных Работ.
        </Text>
        <Text style={styles.paragraph}>
          Оплата стоимости Работ и запасных частей производится посредством
          перечисления денежных средств на счет Исполнителя, указанный в
          настоящем Договоре. Обязательство Заказчика по оплате стоимости Работ
          и запасных частей считается исполненным с момента списания денежных
          средств с расчетного счета Заказчика.
        </Text>
        <Text style={[styles.sectionTitle, { marginTop: 27 }]}>
          5. ОБЯЗАННОСТИ ЗАКАЗЧИКА
        </Text>
        <Text style={styles.paragraph}>
          5.1. Заказчик обязуется организовать обучение сотрудников Исполнителя.
          В случае проведения обучения на территории Заказчика, проживание и
          транспортные расходы на обучение оплачиваются Исполнителем.
        </Text>
        <Text style={styles.paragraph}>
          5.2. Заказчик обязуется осуществлять консультирование персонала
          Исполнителя, а также своевременно предоставлять актуальную информацию
          о новых изделиях, изменениях в уже существующих изделиях, а также всею
          информацию, которая имеет существенное значение для выполнения Работ.
        </Text>
        <Text style={styles.sectionTitle}>
          6. СРОК ДЕЙСТВИЯ И ПРЕКРАЩЕНИЕ ДОГОВОРА
        </Text>
        <Text style={styles.paragraph}>
          6.1. Настоящий Договор вступает в силу с момента подписания Сторонами
          и действует один календарный год. Договор каждый раз автоматически
          продлевается на 1 (один) календарный год. Количество таких
          автоматических продлений не ограничено.
        </Text>
        <Text style={styles.paragraph}>
          6.2. Любая из сторон вправе в любое время без объяснения причин
          расторгнуть настоящий Договор в одностороннем порядке, уведомив об
          этом вторую сторону за 3 (три) месяца до момента расторжения.
        </Text>
        <Text style={styles.paragraph}>
          6.3. Расторжение или прекращение настоящего Договора по любым
          основаниям не освобождает Заказчика от обязанности оплатить стоимость
          уже выполненных надлежащим образом к моменту расторжения Договора
          Работ и запасных частей, использованных для их выполнения, равно как
          не освобождает Исполнителя от предусмотренной законом и настоящим
          Договором ответственности за качество Работ и за допущенные
          Исполнителем нарушения настоящего Договора.
        </Text>
        <Text style={styles.sectionTitle}>
          7. ОБСТОЯТЕЛЬСТВА НЕПРЕОДОЛИМОЙ СИЛЫ
        </Text>
        <Text style={styles.paragraph}>
          7.1. Каждая из Сторон освобождается от ответственности за частичное
          или полное неисполнение своих обязательств по настоящему Договору,
          если такое неисполнение вызвано обстоятельствами непреодолимой силы,
          такими как стихийные бедствия, экстремальные погодные условия, пожар,
          война, забастовки, дорожно-транспортные происшествия, гражданские
          беспорядки, государственное вмешательство, эмбарго и т.п. В этом
          случае срок на выполнение обязательств по Договору продлевается на
          период действия указанных обстоятельств.
        </Text>
        <Text style={styles.paragraph}>
          7.2. Сторона, затронутая действием обстоятельств непреодолимой силы,
          обязана незамедлительно сообщать другой Стороне о наступлении и
          прекращении упомянутых обстоятельств. Если соответствующая Сторона не
          сообщает о наступлении обстоятельств непреодолимой силы в течение 20
          (двадцати) календарных дней с даты их первого вмешательства в
          выполнение настоящего Договора, она лишается права ссылаться на такие
          обстоятельства в обоснование неисполнения своих обязательств по
          настоящему Договору.
        </Text>
        <Text style={styles.paragraph}>
          7.3. Если указанные обстоятельства длятся более 6 (шести) месяцев,
          каждая из Сторон вправе, отказаться от исполнения Договора полностью
          или частично, в этом случае ни одна из Сторон не вправе требовать от
          другой Стороны какой-либо компенсации возможных убытков.
        </Text>
        <Text style={styles.sectionTitle}>
          8. СОБЛЮДЕНИЕ НОРМ, ПРАВИЛ И ТРЕБОВАНИЙ ЗАКОНОДАТЕЛЬСТВА
        </Text>
        <Text style={styles.paragraph}>
          8.1. Исполнитель настоящим соглашается и заверяет Заказчика в том, что
          он будет соблюдать все применимые законы Российской Федерации, правила
          и нормы, установленные для его вида деятельности.
        </Text>
        <Text style={styles.paragraph}>
          8.2. Исполнитель должен осуществлять свои права и исполнять
          обязанности без ущерба для репутации Заказчика.
        </Text>
        <Text style={styles.sectionTitle}>9. КОНФИДЕНЦИАЛЬНОСТЬ</Text>
        <Text style={styles.paragraph}>
          9.1. Стороны подтверждают, что условия и положения настоящего
          Договора, а также любые материалы, сведения и данные, касающиеся
          настоящего Договора или Продукции, а также деятельности Сторон,
          являются конфиденциальной информацией и не могут раскрываться
          какой-либо Стороной третьим лицам без предварительного получения на
          это письменного согласия другой Стороны, за исключением случаев, когда
          такое раскрытие требуется для осуществления прав и исполнения
          обязанностей соответствующей Стороны по настоящему Договору, включая,
          помимо прочего, получение официальных разрешений, согласий,
          сертификатов, оплату налогов, пошлин и сборов, а также в других
          случаях, предусмотренных действующим законодательством.
        </Text>
        <Text style={styles.paragraph}>
          9.2. Обязательство по соблюдению конфиденциальности остается в силе в
          течение всего срока действия настоящего Договора и 5 (пяти) лет после
          его прекращения по любым основаниям.
        </Text>
        <Text style={styles.sectionTitle}>10. УВЕДОМЛЕНИЯ</Text>
        <Text style={styles.paragraph}>
          10.1. Любые уведомления, направляемые Сторонами друг другу в связи с
          настоящим Договором (за исключением сообщений, которые настоящим
          Договором допускается направлять по электронной почте или с помощью
          аналогичных средств связи) должны быть оформлены в письменном виде и
          направляться одним из ниже перечисленных способов:
        </Text>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>- Почтой России;</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>- Курьерской службой;</Text>
        </View>
        <View style={styles.bulletItem}>
          <Text style={styles.paragraph}>
            - Курьером (доставка из рук в руки).
          </Text>
        </View>
        <Text style={styles.paragraph}>
          10.2. Все уведомления должны направляться на адреса, указанные в п. 12
          настоящего Договора (или на иной адрес, которые соответствующая
          Сторона сообщит другой Стороне в письменном виде в соответствии с
          положениями настоящего п. 10).
        </Text>
        <Text style={styles.paragraph}>
          10.2. Стороны условились, что для обмена следующими документами:
          счета-фактуры, акты выполненных работ, товарные накладные, отчеты о
          ремонте, рекламации и других документов, участвующих в оформлении
          финансово-хозяйственной деятельности и взаимных расчетах, возможно
          использовать систему электронного документооборота. Документы,
          отправленные через систему ЭДО, считаются юридически значимыми и имеют
          ту же юридическую силу, что и документы, подписанные на бумаге. Каждая
          из сторон обязуется обеспечить защиту информации и соблюдение
          конфиденциальности при использовании системы ЭДО.
        </Text>
        <Text style={styles.sectionTitle}>11. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ</Text>
        <Text style={styles.paragraph}>
          11.1. Обязанности Исполнителя в рамках настоящего Договора ограничены
          исключительно выполнением Работ по гарантийному и постгарантийному
          ремонту Продукции.
        </Text>
        <Text style={styles.paragraph}>
          11.2. Любые разногласия Сторон, вытекающие из настоящего Договора,
          подлежат в первую очередь разрешению путем переговоров между
          Сторонами. Если Стороны не смогут разрешить свои разногласия путем
          переговоров, то такие разногласия передаются на разрешение
          Арбитражного суда г. Москвы в соответствии с применимым
          законодательством.
        </Text>
        <Text style={styles.paragraph}>
          11.3. Любые изменения и дополнения к настоящему Договору должны быть
          оформлены в письменном виде и подписаны уполномоченными
          представителями обеих Сторон, за исключением случаев, когда настоящим
          Договором предусмотрено право Заказчика вносить изменения и дополнения
          к настоящему Договору в одностороннем порядке. В таких случаях, если
          иное не вытекает из положений настоящего Договора, Договор считается
          измененным в дату получения Исполнителем соответствующего уведомления
          об изменении.
        </Text>
        <Text style={styles.paragraph}>
          11.4. Исполнитель не вправе переуступать и передавать свои права и
          обязанности по настоящему Договору третьим лицам без предварительного
          письменного согласия Заказчика.
        </Text>
        <Text style={styles.paragraph}>
          11.5. Положения настоящего Договора отражают полное взаимопонимание
          Сторон по его предмету, и настоящий Договор заменяет собой все
          предыдущие переговоры и ранее достигнутые договоренности, и письменные
          соглашения по его предмету.
        </Text>
        <Text style={styles.paragraph}>
          11.6. Настоящий Договор не предполагает создание агентских отношений
          согласно законодательству Российской Федерации и не создает такого
          рода отношений.
        </Text>
        <Text style={styles.paragraph}>
          11.7. Все приложения к настоящему Договору являются его неотъемлемой
          частью, и их действие прекращается одновременно с прекращением
          действия настоящего Договора по любым основаниям, если Стороны в явной
          форме не договорятся об ином.
        </Text>
        {/* Блок с реквизитами */}
        <View style={styles.requisitesContainer}>
          <Text style={styles.requisitesTitle}>
            12. АДРЕСА И РЕКВИЗИТЫ СТОРОН
          </Text>

          {/* Контейнер для двух колонок */}
          <View style={styles.requisitesColumns}>
            {/* Колонка Заказчика */}
            <View style={styles.requisiteColumn}>
              <Text style={styles.requisiteText}>Заказчик:</Text>
              <Text style={styles.requisiteText}>ООО «ГЕФФЕН»</Text>
              <Text style={styles.requisiteText}>
                300004, г. Тула, ул. Щегловская засека, д. 31, 1 этаж, пом. 116
              </Text>
              <Text style={styles.requisiteText}>ИНН 7105049609</Text>
              <Text style={styles.requisiteText}>КПП 710501001</Text>
              <Text style={styles.requisiteText}>р/с 40702810966000001077</Text>
              <Text style={styles.requisiteText}>
                В банке ТУЛЬСКОЕ ОТДЕЛЕНИЕ №8604 ПАО СБЕРБАНК
              </Text>
              <Text style={styles.requisiteText}>БИК 047003608</Text>
              <Text style={styles.requisiteText}>к/с 30101810300000000608</Text>

              {/* Подпись и печать Заказчика */}
              <Text style={styles.requisiteText}>Директор ООО «ГЕФФЕН»</Text>
              <Text>_____________________/Орехов А.С./</Text>
              <Text style={styles.requisiteText}>М.П.</Text>
            </View>

            {/* Колонка Исполнителя */}
            <View style={styles.requisiteColumn}>
              <Text style={styles.requisiteText}>Исполнитель:</Text>
              <Text style={styles.requisiteText}>{data?.company_name}</Text>
              <Text style={styles.requisiteText}>{data?.legal_address}</Text>
              <Text style={styles.requisiteText}>ИНН {data?.inn}</Text>
              <Text style={styles.requisiteText}>КПП {data?.kpp}</Text>
              <Text style={styles.requisiteText}>
                р/с {data?.current_account}
              </Text>
              <Text style={styles.requisiteText}>
                В банке {data?.bank_name?.toUpperCase()}
              </Text>
              <Text style={styles?.requisiteText}>БИК {data?.bic}</Text>
              <Text style={styles.requisiteText}>
                к/с {data?.correspondent_account}
              </Text>
              <Text style={styles?.requisiteText}>
                {data?.position + " " + data?.company_name}
              </Text>

              {/* Подпись и печать Исполнителя */}
              <Text style={[styles.requisiteText]}>
                {`________________/${
                  data?.full_name
                    ?.split(" ")
                    .map((word, index) => (index === 0 ? word : word[0] + "."))
                    .join(" ") || ""
                }/`}
              </Text>

              <Text style={styles.requisiteText}>М.П.</Text>
            </View>
          </View>
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        {/* Заголовок Приложения */}
        <Text style={[styles.sectionTitle, { textAlign: "right" }]}>
          Приложение № 1
        </Text>
        <Text style={[styles.paragraph, { textAlign: "right" }]}>
          к Договору № {data?.contract_number}-АСЦ от {formattedDate}
        </Text>

        {/* Основной текст приложения */}
        <Text style={[styles.paragraph, { marginTop: 55 }]}>
          Сторонами определяется на период действия Договора перечень котлов
          GEFFEN изготовленных с применением теплообменников собственного
          производства, подлежащих гарантийному ремонту силами Исполнителя:
        </Text>

        {/* Список котлов */}
        <View style={{ marginTop: "15px" }}>
          {data?.service_access_3_1_127_301 && (
            <View style={[styles.bulletItem]}>
              <Text style={styles.paragraph}>
                - котлы GEFFEN MB 3.1 127, 145, 200, 251, 301 кВт.
              </Text>
            </View>
          )}
          {data?.service_access_4_1 && (
            <View style={[styles.bulletItem, { marginTop: 5 }]}>
              <Text style={styles.paragraph}>
                - котлы GEFFEN MB 4.1 40, 60, 80, 99 кВт;
              </Text>
            </View>
          )}
          {data?.service_access_3_1_400_2000 && (
            <View style={[styles.bulletItem, { marginTop: 5 }]}>
              <Text style={styles.paragraph}>
                - котлы GEFFEN MB 3.1 400, 500, 660, 800, 1060, 1199, 1600, 2000
                кВт.
              </Text>
            </View>
          )}
        </View>

        {/* Специалист АСЦ, ФИО, телефон */}
        <Text style={[styles.paragraph, { marginTop: 50 }]}>
          Специалист АСЦ{"\n"}
          ФИО: {data?.contact_person}
          {"\n"}
          Контактный телефон: {data?.phone_number}
        </Text>

        {/* Подписи сторон */}
        <Text
          style={[styles.paragraph, { marginTop: 200, textAlign: "center" }]}
        >
          Подписи сторон
        </Text>

        {/* Две колонки: Заказчик (слева), Исполнитель (справа) */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 25,
          }}
        >
          {/* Левая колонка - Заказчик */}
          <View style={{ width: "45%" }}>
            <Text style={styles.paragraph}>Заказчик:</Text>
            <Text style={styles.paragraph}>ООО «ГЕФФЕН»</Text>
            <Text style={[styles.paragraph, { marginTop: 25 }]}>
              ______________________
            </Text>
            <Text style={[styles.paragraph, { marginTop: 10 }]}>
              А.С. Орехов
            </Text>
            <Text style={[styles.paragraph, { marginTop: 10 }]}>М.П.</Text>
          </View>

          {/* Правая колонка - Исполнитель */}
          <View style={{ width: "45%" }}>
            <Text style={styles.paragraph}>Исполнитель:</Text>
            <Text style={styles.paragraph}>{data?.company_name}</Text>
            <Text style={[styles.paragraph, { marginTop: 25 }]}>
              ______________________
            </Text>
            <Text style={[styles.paragraph, { marginTop: 10 }]}>
              {data?.full_name.split(" ")[1][0] +
                "." +
                data?.full_name.split(" ")[2][0] +
                ". " +
                data?.full_name.split(" ")[0]}
            </Text>
            <Text style={[styles.paragraph, { marginTop: 10 }]}>М.П.</Text>
          </View>
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionTitle, { textAlign: "right" }]}>
          Приложение № 2
        </Text>
        <Text style={[styles.paragraph, { textAlign: "right" }]}>
          к Договору № {data?.contract_number}-АСЦ от {formattedDate}
        </Text>
        <Text style={[styles.subTitle, { marginTop: 20 }]}>
          Стоимость работ
        </Text>
        <View style={{ fontSize: 10 }}>
          <MyTable data={dataPrices !== null ? dataPrices : []} />
        </View>
        <Text style={(styles.paragraph, { marginTop: 10 })}>
          Стоимость Работ указана с учетом транспортных расходов.
        </Text>
        <Text style={[styles.paragraph, styles.italic]}>
          При необходимости выезда за черту города на расстояние более 100 км,
          стоимость работ дополнительно согласовывать с ООО «ГЕФФЕН».{"\n"}
          Контактный номер +7 903 697 69 43
        </Text>
        <View>
          <Text style={[styles.signatureHeader, { marginTop: 350 }]}>
            Подписи сторон
          </Text>
          <View style={styles.signatureView}>
            <View style={{ width: "35%" }}>
              <Text>Заказчик:</Text>
              <Text>ООО «ГЕФФЕН»</Text>
              <Text style={styles.signatureMargin}></Text>
              <View style={styles.signatureLine}></View>
              <Text>А.С. Орехов</Text>
              <Text>М.П.</Text>
            </View>
            <View style={{ width: "35%" }}>
              <Text>Исполнитель:</Text>
              <Text>{data?.company_name}</Text>
              <Text style={styles.signatureMargin}></Text>
              <View style={styles.signatureLine}></View>
              <Text>
                {data?.full_name.split(" ")[1][0] +
                  "." +
                  data?.full_name.split(" ")[2][0] +
                  ". " +
                  data?.full_name.split(" ")[0]}
              </Text>
              <Text>М.П.</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const MyTable = ({ data }) => (
  <View style={styles.table}>
    {/* Заголовок таблицы */}
    <View style={styles.tableRow}>
      <Text
        style={[styles.tableColHeader, styles.colSmall, styles.alignCenter]}
      >
        № п/п
      </Text>
      <Text
        style={[styles.tableColHeader, styles.colLarge, styles.alignCenter]}
      >
        Наименование работ
      </Text>
      <Text
        style={[styles.tableColHeader, styles.colMedium, styles.alignCenter]}
      >
        Стоимость
      </Text>
    </View>

    {/* Динамическое заполнение строк */}
    {data?.map((item, index) => (
      <View style={styles.tableRow} key={index}>
        <Text style={[styles.tableCol, styles.colSmall]}>{index + 1}</Text>
        <Text style={[styles.tableCol, styles.colLarge]}>
          {item?.service_name}
        </Text>
        <Text style={[styles.tableCol, styles.colMedium]}>
          {item?.price * item.coefficient} ₽
        </Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    fontFamily: "Roboto",
    fontSize: 12,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    //marginBottom: 5,
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    //marginBottom: 15,
  },
  city: {
    fontSize: 12,
  },
  date: {
    fontSize: 12,
  },
  paragraph: {
    textAlign: "justify",
    //marginBottom: 10,
    lineHeight: 1.0,
    textIndent: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    //marginTop: 10,
    //marginBottom: 5,
  },
  bulletItem: {
    marginLeft: 15,
    marginBottom: 5,
  },
  subTitle: {
    textAlign: "center",
  },
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
    fontWeight: "bold",
    borderRight: 1,
    paddingTop: 7,
  },
  tableCol: {
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: "7px 0px 0px 5px",
  },
  colSmall: {
    width: "50px",
  },
  colLarge: {
    flexGrow: 1,
  },
  alignCenter: { textAlign: "center" },
  colMedium: {
    width: "100px",
    textAlign: "left",
  },
  italic: {
    fontStyle: "italic",
    paddingTop: 10,
    textIndent: 25,
  },
  signatureHeader: { textAlign: "center" },
  signatureView: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureMargin: { marginTop: 35 },
  signatureMarginTop: { marginTop: 18 },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 5,
  },
  paragraphNoMargin: {
    marginTop: 0,
    paddingTop: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  requisitesContainer: {
    marginTop: 10,
  },
  requisitesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  requisitesColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  requisiteColumn: {
    width: "45%",
  },
  requisiteText: {
    fontSize: 12,
    lineHeight: 1.0,
    marginBottom: 5,
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
    {
      src: RobotoItalic,
      fontStyle: "italic",
    },
  ],
});
