import axios from "axios";
import { z } from "zod";
// import {object, string, number, type InferOutput, parse} from 'valibot';
import type { SearchType } from "../types";
import { useMemo, useState } from "react";

//*No mantenible: Type Guards o assertion.  Si esta función devuelve true, entonces puedes tratar weather (: weather is Weather)
// function isWeatherResponse(weather : unknown): weather is Weather{ //Es una buena practica el unknown para las respuestas de las apis
//     return (
//         Boolean(weather) &&                     // Verifica que no sea null o undefined
//         typeof weather === 'object' &&          // Verifica que sea un objeto
//         typeof (weather as Weather).name === 'string' &&      // Que tenga un campo "name" de tipo string
//         typeof (weather as Weather).main.temp === 'number' && // Que "main.temp" sea número
//         typeof (weather as Weather).main.temp_max === 'number' &&
//         typeof (weather as Weather).main.temp_min === 'number'
//     );
// }
//El type guard de arriba está verificando que weather tenga la estructura:
// {
//   name: string,
//   main: {
//     temp: number,
//     temp_max: number,
//     temp_min: number
//   }
// }

//*Zod: Se puede crear un eschema y mediante esto se va a inferir el tipo de dato con zod
const Weather = z.object({
  name: z.string(),
  main: z.object({
    temp: z.number(),
    temp_max: z.number(),
    temp_min: z.number(),
  }),
});
export type Weather = z.infer<typeof Weather>; //Inferencia de tipo de dato

//*Alternativa de zod: Valibot
// const WeatherSchema = object({
//     name: string(),
//     main: object({
//         temp: number(),
//         temp_max: number(),
//         temp_min: number()
//     })
// })
// type Weather = InferOutput<typeof WeatherSchema> //Inferencia de tipo con valibot

const initialState = {
  name: "",
  main: {
    temp: 0,
    temp_max: 0,
    temp_min: 0,
  },
};
export default function useWeather() {

  const [weather, setWeather] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchWeather = async (search: SearchType) => {
    const appId = import.meta.env.VITE_API_KEY;
    setLoading(true);
    setWeather(initialState);
    setNotFound(false);
    try {
      const geoURl = `http://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`;
      const { data } = await axios(geoURl); //Por defecto al hacer axios() es como hacer axios.get()...

      if(!data[0]){
        setNotFound(true);
        return;
      }

      const lat = data[0].lat;
      const lon = data[0].lon;

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`;
      //!Esto es una mala practica porque estamos "casteando" el type con <Weather>, es la menos recomendada, NO HACER
      //   const {data: weatherResult} = await axios<Weather>(weatherUrl);
      //   console.log(weatherResult.main.temp)

      //!Type Guards. Es mucho mejor que el cast pero no es un codigo mantenible a largo plazo
      //   const {data: weatherResult} = await axios(weatherUrl);
      //   const result = isWeatherResponse(weatherResult);
      //   if(result) {
      //     console.log(weatherResult.name)
      //   }else{
      //     console.log("respuesta mal formada")
      //   }

      //*Zod: Es mejor opción que type guard (la mejor)
      const { data: weatherResult } = await axios(weatherUrl);
      const result = Weather.safeParse(weatherResult); //Esto es exactamente lo mismo que lo que tenemos con type guard, pero màs facil
      if (result.success) {
        setWeather(result.data);
      }

      //*Valibot: Alternativa de zod, màs ligera y màs rapida de usar
      // const {data: weatherResult} = await axios(weatherUrl);
      // const result = parse(WeatherSchema, weatherResult);
      // if(result){
      //     console.log(result.main)
      // }
      // //Como nos damos cuenta, podemos usar zod o valibot para la inferencia de tipos
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const hasWeatherData = useMemo(() => weather.name, [weather]);

  return {
    weather,
    hasWeatherData,
    loading,
    notFound,
    fetchWeather,
  };
}
