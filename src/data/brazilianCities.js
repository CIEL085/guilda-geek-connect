// Lista das principais cidades brasileiras por estado
export const BRAZILIAN_CITIES = [
  // São Paulo
  "São Paulo, SP", "Campinas, SP", "Santos, SP", "São Bernardo do Campo, SP", 
  "Santo André, SP", "Osasco, SP", "Sorocaba, SP", "Ribeirão Preto, SP",
  "São José dos Campos, SP", "Guarulhos, SP", "Mauá, SP", "Diadema, SP",
  "Carapicuíba, SP", "Piracicaba, SP", "Bauru, SP", "Jundiaí, SP",
  
  // Rio de Janeiro
  "Rio de Janeiro, RJ", "Niterói, RJ", "Duque de Caxias, RJ", "Nova Iguaçu, RJ",
  "São Gonçalo, RJ", "Campos dos Goytacazes, RJ", "Petrópolis, RJ", "Volta Redonda, RJ",
  "Magé, RJ", "Belford Roxo, RJ", "Nova Friburgo, RJ", "Macaé, RJ",
  
  // Minas Gerais
  "Belo Horizonte, MG", "Uberlândia, MG", "Contagem, MG", "Juiz de Fora, MG",
  "Betim, MG", "Montes Claros, MG", "Ribeirão das Neves, MG", "Uberaba, MG",
  "Governador Valadares, MG", "Ipatinga, MG", "Santa Luzia, MG", "Sete Lagoas, MG",
  
  // Bahia
  "Salvador, BA", "Feira de Santana, BA", "Vitória da Conquista, BA", "Camaçari, BA",
  "Juazeiro, BA", "Ilhéus, BA", "Itabuna, BA", "Lauro de Freitas, BA",
  "Jequié, BA", "Alagoinhas, BA", "Barreiras, BA", "Porto Seguro, BA",
  
  // Paraná
  "Curitiba, PR", "Londrina, PR", "Maringá, PR", "Ponta Grossa, PR",
  "Cascavel, PR", "São José dos Pinhais, PR", "Foz do Iguaçu, PR", "Colombo, PR",
  "Guarapuava, PR", "Paranaguá, PR", "Araucária, PR", "Toledo, PR",
  
  // Rio Grande do Sul
  "Porto Alegre, RS", "Caxias do Sul, RS", "Pelotas, RS", "Canoas, RS",
  "Santa Maria, RS", "Gravataí, RS", "Viamão, RS", "Novo Hamburgo, RS",
  "São Leopoldo, RS", "Rio Grande, RS", "Alvorada, RS", "Passo Fundo, RS",
  
  // Santa Catarina
  "Florianópolis, SC", "Joinville, SC", "Blumenau, SC", "São José, SC",
  "Chapecó, SC", "Criciúma, SC", "Itajaí, SC", "Jaraguá do Sul, SC",
  "Lages, SC", "Palhoça, SC", "Balneário Camboriú, SC", "Brusque, SC",
  
  // Pernambuco
  "Recife, PE", "Jaboatão dos Guararapes, PE", "Olinda, PE", "Caruaru, PE",
  "Petrolina, PE", "Paulista, PE", "Cabo de Santo Agostinho, PE", "Camaragibe, PE",
  "Garanhuns, PE", "Vitória de Santo Antão, PE", "Igarassu, PE", "Abreu e Lima, PE",
  
  // Ceará
  "Fortaleza, CE", "Caucaia, CE", "Juazeiro do Norte, CE", "Maracanaú, CE",
  "Sobral, CE", "Crato, CE", "Itapipoca, CE", "Maranguape, CE",
  "Iguatu, CE", "Quixadá, CE", "Canindé, CE", "Pacajus, CE",
  
  // Goiás
  "Goiânia, GO", "Aparecida de Goiânia, GO", "Anápolis, GO", "Rio Verde, GO",
  "Luziânia, GO", "Águas Lindas de Goiás, GO", "Valparaíso de Goiás, GO", "Trindade, GO",
  "Formosa, GO", "Novo Gama, GO", "Itumbiara, GO", "Senador Canedo, GO",
  
  // Espírito Santo
  "Vitória, ES", "Vila Velha, ES", "Serra, ES", "Cariacica, ES",
  "Cachoeiro de Itapemirim, ES", "Linhares, ES", "São Mateus, ES", "Colatina, ES",
  "Guarapari, ES", "Aracruz, ES", "Viana, ES", "Nova Venécia, ES",
  
  // Pará
  "Belém, PA", "Ananindeua, PA", "Santarém, PA", "Marabá, PA",
  "Castanhal, PA", "Parauapebas, PA", "Itaituba, PA", "Cametá, PA",
  "Bragança, PA", "Abaetetuba, PA", "Marituba, PA", "Altamira, PA",
  
  // Maranhão
  "São Luís, MA", "Imperatriz, MA", "São José de Ribamar, MA", "Timon, MA",
  "Caxias, MA", "Codó, MA", "Paço do Lumiar, MA", "Açailândia, MA",
  "Bacabal, MA", "Balsas, MA", "Santa Inês, MA", "Pinheiro, MA",
  
  // Amazonas
  "Manaus, AM", "Parintins, AM", "Itacoatiara, AM", "Manacapuru, AM",
  "Coari, AM", "Tefé, AM", "Tabatinga, AM", "Maués, AM",
  
  // Distrito Federal
  "Brasília, DF",
  
  // Outros estados (principais cidades)
  "Aracaju, SE", "Maceió, AL", "Teresina, PI", "Natal, RN",
  "João Pessoa, PB", "Cuiabá, MT", "Campo Grande, MS", "Porto Velho, RO",
  "Rio Branco, AC", "Boa Vista, RR", "Macapá, AP", "Palmas, TO"
];

export const filterCities = (query) => {
  if (!query || query.trim().length < 2) return [];
  
  const normalizedQuery = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  return BRAZILIAN_CITIES.filter(city => 
    city
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes(normalizedQuery)
  ).slice(0, 8); // Limita a 8 resultados
};
