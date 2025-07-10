export type SearchType = {
    city: string,
    country: string
}

export type Country = {
    code: string,
    name: string
}

//!Esta es la peor forma de obtener el tipado en una petición (castear):
// export type Weather = {
//     name: string,
//     main: {
//         temp: number,
//         temp_max: number,
//         temp_min: number
//     }
// }