
const initMap = () =>{

  // Crear Mapa
  const map = new google.maps.Map(document.getElementById("personal-map"), {
    center: { lat: 41.386993230791525, lng: 2.1700468987535992 },  
    zoom: 2,
  });

  // Input recibido en el Searchbox

  const input = document.getElementById("pac-input");

  // Controles del mapa

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  //Personal Marks

  const URL = 'https://adriaproject2.herokuapp.com/places'

  const markPlaces = () =>{
    axios.get(URL)
      .then((result)=>{
        result.data.forEach((places)=>{
          var service = new google.maps.places.PlacesService(map);
          service.getDetails({
            placeId: places.placeId
          }, 
          function (result) {
            var marker = new google.maps.Marker({
              map: map,
              place: {
                placeId: places.placeId,
                location: result.geometry.location
              }
            });
          });
        })
      })
      .catch((err)=>{
        console.log(err)
      })
  }
  
  markPlaces()

}

initMap()