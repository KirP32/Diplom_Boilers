export default function formatResponseData(data) {
  const boilers = [];
  // for (let key in data) {
  //     if (key.startsWith('module_')) {
  //         boilers.push({
  //             name: key,
  //             t: data[key],
  //             online: 'N/A'
  //         });
  //     }
  // }
  let foo_array = [];
  try {
    data.map((item) =>
      foo_array.push({
        id: Math.floor(Math.random() * 1000) + 1, // ДОЛЖНО БРАТЬСЯ ИЗ БД, СЕЙЧАС ЗАГЛУШКА
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
