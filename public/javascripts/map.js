

const initMap = () =>{

  // Crear Mapa
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 41.386993230791525, lng: 2.1700468987535992 },  
    zoom: 2,
  });


  // Input recibido en el Searchbox

  const input = document.getElementById("pac-input");

  // Autocompletar del Searchbox

  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo("bounds", map);
  autocomplete.setFields(["place_id", "geometry", "name"]);

  // Controles del mapa

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Ventana emergente + Marker, resultado del input

  const infowindow = new google.maps.InfoWindow();
  const infowindowContent = document.getElementById("infowindow-content");
  infowindow.setContent(infowindowContent);

  const marker = new google.maps.Marker({ map: map });
  marker.addListener("click", () => {
    infowindow.open(map, marker);
  });

  autocomplete.addListener("place_changed", () => {
    infowindow.close();
    const place = autocomplete.getPlace();

    if (!place.geometry) {
      return;
    }

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }

    marker.setPlace({
      placeId: place.place_id,
      location: place.geometry.location,
    });

    marker.setVisible(true);
    infowindowContent.children.namedItem("place-name").textContent = place.name;
    infowindowContent.children.namedItem("place-id").textContent = place.place_id;
    infowindowContent.children.namedItem("place-address").textContent = place.formatted_address;
    infowindow.open(map, marker);
  });
}

initMap()

function getId() {
 const idPlace = document.getElementById('place-id').innerText
 const namePlace = document.getElementById('place-name').innerText

 axios.get(`/insertPlace/${idPlace}/${namePlace}`)
  .then((result)=>{
    console.log('hola')
  })
  .catch((err)=>{
    console.log(err)
  })
}



const URL = 'http://localhost:3000/places'

const renderPlaces = () =>{
  axios.get(URL)
    .then((result)=>{
      // console.log(result)
      result.data.forEach((places)=>{
      // console.log(places.placeId)
        const li = document.createElement('li')
        // li.innerText = places.name
        // li.setAttribute("id", this.placeId)
        li.setAttribute("class", "li_class")
        li.innerHTML = `
          ${places.name}

          <form action="/deletePlace/${places.placeId}" method="POST"><button type="submit" class="btn btn-danger">Delete</button></form>
        `
        document.getElementById('my-places').append(li)
    })
      
    })
    .catch((err)=>{
      console.log(err)
    })
}
  
renderPlaces()

// const deletePlaces = () =>{


      // const namePlace = document.getElementById('place-name').innerText

      // axios.delete(`/deletePlace/${namePlace}`)
      // .then((result)=>{
      //   console.log(result)
      // })
      // .catch((err)=>{
      //   console.log(err)
      
    // })

// }
// deletePlaces()
