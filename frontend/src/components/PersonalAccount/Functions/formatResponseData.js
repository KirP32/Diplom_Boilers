export default function formatResponseData(data) {
    const boilers = [];
    for (let key in data) {
        if (key.startsWith('module_')) {
            boilers.push({
                name: key,
                t: data[key],
                online: 'N/A'
            });
        }
    }
    return {
        id: Math.floor(Math.random() * 100) + 1, // ДОЛЖНО БРАТЬСЯ ИЗ БД, СЕЙЧАС ЗАГЛУШКА
        name: data.s_number,
        status: data.wsk_pump == '*ON' ? 'online' : 'offline',
        boilers: boilers
    };
}