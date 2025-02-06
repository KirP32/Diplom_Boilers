export default function formatResponseData(data) {
  let foo_array = [];
  try {
    data.map((item) =>
      foo_array.push({
        id: item.name === "ADS-Line" ? 1 : item.id, // ДОЛЖНО БРАТЬСЯ ИЗ БД, СЕЙЧАС ЗАГЛУШКА
        name: item.name,
        status: "online",
        boilers: item.module_list || [],
      })
    );
  } catch (error) {
    console.log(error);
  }
  return foo_array;
}
