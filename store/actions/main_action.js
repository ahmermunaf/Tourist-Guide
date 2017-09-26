export default class Main_Action {
    static mapData = 'mapData'
    static mainData(value){
        return { 
            type : 'mapData',
            data: value
        }
    }
}