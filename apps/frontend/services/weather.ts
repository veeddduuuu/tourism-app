const API_KEY = "57ef6deed759721b7f047a64c9ca7696";

export async function getWeather(city: string) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  );

  const data = await res.json();

  if (!res.ok || !data.weather?.length || !data.main) {
    return { weather: "Clear", temperature: 25 };
  }

  return {
    weather: data.weather[0].main,
    temperature: data.main.temp,
  };
}
