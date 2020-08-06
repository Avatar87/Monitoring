class Group{
    constructor(index, title, monitorings, uniqueFaces, events, uniqueEvents, totalevents, days, displayAll, startDate, endDate) {
        this._index = index;
        this._title = title;
        this._monitorings = monitorings
        this._uniqueFaces = uniqueFaces;
        this._events = events;
        this._uniqueEvents = uniqueEvents;
        this._totalevents = totalevents;
        this._days = days;
        this._displayAll = displayAll;
        this._startDate = startDate;
        this._endDate = endDate;
    }

    get index(){
        return this._index;
    }

    set index(newIndex){
        this._index = newIndex;
    }

    get title(){
        return this._title;
    }

    set title(newTitle){
        this._title = newTitle;
    }

    get monitorings(){
        return this._monitorings;
    }

    set monitorings(newMonitorings){
        this._monitorings = newMonitorings;
    }

    get uniqueFaces(){
        return this._uniqueFaces;
    }

    set uniqueFaces(newFaces){
        this._uniqueFaces = newFaces;
    }

    get events(){
        return this._events;
    }

    set events(newEvents){
        this._events = newEvents;
    }

    get uniqueEvents(){
        return this._uniqueEvents;
    }

    set uniqueEvents(newEvents){
        this._uniqueEvents = newEvents;
    }

    get totalevents(){
        return this._totalevents;
    }

    set totalevents(newEvents){
        this._totalevents = newEvents;
    }

    get days(){
        return this._days;
    }

    set days(newDays){
        this._days = newDays;
    }

    get displayAll(){
        return this._displayAll;
    }

    set displayAll(newDisplayAll){
        this._displayAll = newDisplayAll;
    }

    get startDate(){
        return this._startDate;
    }

    set startDate(newDate){
        this._startDate = newDate;
    }

    get endDate(){
        return this._endDate;
    }

    set endDate(newDate){
        this._endDate = newDate;
    }

}

module.exports = Group;
