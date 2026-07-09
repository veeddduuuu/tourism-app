const API_KEY = "O6v3CTkQxtZTzyK80b6udfQ8BxeTCPpsl7wdp3SCNeuOYsmWMcbSQ7bJ";

const response = await fetch(
`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(query)}&image_type=photo`
);