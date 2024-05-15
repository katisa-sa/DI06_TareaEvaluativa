import { TestBed } from '@angular/core/testing';
import { GestionApiService } from './gestion-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RespuestaNoticias } from '../interfaces/interfaces';
import { environment } from 'src/environments/environment';

describe('GestionApiService', () => {
  //Inicializaremos el servicio
  let service : GestionApiService;
  //Necesitaremos un mock para sustituir el HttpCliente
  let httpMock : HttpTestingController;
  //Habrá que import los modulos necesarios, como por ejemplo para simular HttpClient
  beforeEach(() => {
    TestBed.configureTestingModule({
      //importamos el httpClienteTestingModule (OJO, no importamos httpClient)
      imports:[HttpClientTestingModule],
      //En providers añadilos el servicio que vamos a utilizar
      providers: [GestionApiService]
    });
    //Inyectamos el servicio al TestBed
    service = TestBed.inject(GestionApiService);
    //Inyectamos el httpTestingController al TestBed
    httpMock = TestBed.inject(HttpTestingController);
  });

  //afterEach, verificamos httpMock que no queden respuestas pendientes
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  //Simulamos sin ejecutar la lógica a ver si podemos llamar al método cargarCategoria
  it("Comprobar si podemos llamar al método cargarCategoria", () => {
    spyOn(service,'cargarCategoria');
    service.cargarCategoria('general');
    expect(service.cargarCategoria).toHaveBeenCalled();
  });
  

  //
  it('Debería cargar los datos en el BehaviorSubject correctamente', () => {
    const categoria = 'business';
    //Necesitaremos un mock de tipo RespuestasNoticias para simular la respuesta del servidor 
    const mockResponse: RespuestaNoticias = {
      "status": "ok",
      "totalResults": 2,
      "articles": [
          {
              source: {
                  id: undefined,
                  name: 'Reuters'
              },
              author: 'Reuters',
              title: "Asia shares hit 15-month high as traders wait for CPI - Reuters",
              description: undefined,
              url: "https://www.reuters.com/markets/global-markets-wrapup-1-2024-05-14/",
              urlToImage: undefined,
              publishedAt: "2024-05-14T08:03:47Z",
              content: undefined
          },
          {
              source: {
                  id: undefined,
                  name: "CNBC"
              },
              author: "Ryan Browne",
              title: "Sony reports 7% drop in annual profit as PlayStation 5 sales miss trimmed target - CNBC",
              description: "Sony on Tuesday reported a 7% drop in annual profits in the fiscal year 2023, logging its first drop in annual profits since 2020.",
              url: "https://www.cnbc.com/2024/05/14/sony-q4-and-full-year-2023-earnings.html",
              urlToImage: "https://image.cnbcfm.com/api/v1/image/107414419-1715671077252-gettyimages-1928384976-pekiaridis-notitle240115_npKWW.jpeg?v=1715671197&w=1920&h=1080",
              publishedAt: "2024-05-14T06:22:13Z",
              content: "Sony said sales of its flagship PlayStation 5 console totalled 20.8 million in the fiscal year 2023 slightly lower than an already revised-down 21 million unit target.\r\nSony on Tuesday reported a 7% … [+2529 chars]"
          }
        ]
      };

    //Ejecutamos la lógica de cargarCategoria para testear que el BehaviorSuject funciona correctamente
      service.cargarCategoria(categoria);
    //Simulamos una llamada API y esperamos una respuesta y que sea de tipo GET
    //Recordar que hacemos uso de HttpTestingController, no de httpClient, por tanto, estamos simulando la llamada API.
      const resp = httpMock.expectOne("https://newsapi.org/v2/top-headlines?country=us&category=" + categoria + "&apiKey=" + service.apiKey);
      expect(resp.request.method).toBe('GET');

    //Necesitaremos apiKey de cada uno. 
    //IMPORTANTE MODIFICAR EL APIKEY EN LA CARPETA ENVIRONMENTS
    //Simulamos que la respuesta del servidor sea nuestro mockResponse (flush)
      resp.flush(mockResponse);
    //datos$ tendría que modificarse con los datos simulados (categoria=business y totalResults=2), por tanto data contendrá esos datos.
    //Aquí habrá que hacer el subscribe de datos$, y comprobaremos que data esté definido y que data.categoria y data.totalResults son iguales a nuestra categoria y totalResults
      service.datos$.subscribe(data => {
        expect(data).toBeDefined();
        expect(data?.categoria).toBe(categoria);
        expect (data?.totalResults).toBe(mockResponse.totalResults);
      })
  });
});
