
const createMap = () => {

  const defaultLocation = {
    lat: 41.385935,
    lng: 2.136195
  }

  let myLocation = {lat: '', lng: ''}


  const map = new google.maps.Map(document.getElementById('map'), {
    center: defaultLocation,
    zoom: 20
  })

  const createMarker = (_location)=>{
    new google.maps.Marker({
      map: map,
      position: _location,
      animation: google.maps.Animation.DROP
    })
  }

  navigator.geolocation.getCurrentPosition((position)=>{

    const myLat = position.coords.latitude
    const myLng = position.coords.longitude

    console.log('lat: ', myLat)
    console.log('lng: ', myLng)

    myLocation.lat = myLat
    myLocation.lng = myLng

    const latLng = new google.maps.LatLng(myLat, myLng);
    map.panTo(latLng)
    createMarker(myLocation)
    // map.setCenter(myLocation)
  })

  createMarker(defaultLocation)

}
createMap()