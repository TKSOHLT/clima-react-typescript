import axios from "axios";
import type { SearchType, Weather } from "../types";

//*No mantenible: Type Guards o assertion.  Si esta función devuelve true, entonces puedes tratar weather (: weather is Weather)
function isWeatherResponse(weather : unknown): weather is Weather{ //Es una buena practica el unknown para las respuestas de las apis
    return (
        Boolean(weather) &&                     // Verifica que no sea null o undefined
        typeof weather === 'object' &&          // Verifica que sea un objeto
        typeof (weather as Weather).name === 'string' &&      // Que tenga un campo "name" de tipo string
        typeof (weather as Weather).main.temp === 'number' && // Que "main.temp" sea número
        typeof (weather as Weather).main.temp_max === 'number' &&
        typeof (weather as Weather).main.temp_min === 'number'
    );
}
//El type guard de arriba está verificando que weather tenga la estructura:
// {
//   name: string,
//   main: {
//     temp: number,
//     temp_max: number,
//     temp_min: number
//   }
// }

export default function useWeather() {
  const fetchWeather = async (search: SearchType) => {
    const appId = import.meta.env.VITE_API_KEY;
    try {
      const geoURl = `http://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`;
      const {data} = await axios(geoURl) //Por defecto al hacer axios() es como hacer axios.get()...
      
      const lat = data[0].lat;
      const lon = data[0].lon;

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`;
      //!Esto es una mala practica porque estamos "casteando" el type con <Weather>, es la menos recomendada, NO HACER
    //   const {data: weatherResult} = await axios<Weather>(weatherUrl);
    //   console.log(weatherResult.main.temp)

      //*Buena practica: Type Guards. 
      const {data: weatherResult} = await axios(weatherUrl);
      const result = isWeatherResponse(weatherResult);
      if(result) {
        console.log(weatherResult.name)
      }else{
        console.log("respuesta mal formada")
      }
    } catch (error) {
      console.log(error);
    }
  };
  return {
    fetchWeather,
  };
}
