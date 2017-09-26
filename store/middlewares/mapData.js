import Main_Action from "./../actions/main_action.js";
import Reactotron from 'reactotron-react-native'
export default class MainMiddleware {
    static asyncMain(search) {
        return (dispatch) => {
            var mapData = []
            var data = fetch('https://maps.googleapis.com/maps/api/directions/json?origin=75+9th+Ave+New+York,+NY&destination=MetLife+Stadium+1+MetLife+Stadium+Dr+East+Rutherford,+NJ+07073&key=AIzaSyBBprSf6e99mIHNukg-kcK_z_uk8EcTZUg ')
            console.log(data)
            dispatch(Main_Action.mainData(mapData))
        }
    }
}