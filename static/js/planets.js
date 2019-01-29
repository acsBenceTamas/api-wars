function listPlanets( apiTarget='https://swapi.co/api/planets')
{
    startLoading();
    fetch(apiTarget)
    .then((response) => response.json())
    .then((data) => {
        populatePlanetList(data);
    })
}

function listResidents( apiTargetList )
{
    startLoading();
    let fetchId = 0;
    let residents = [];
    fetch(apiTarget)
    .then((response) => response.json())
    .then((data) => {
        residents.push(data);
    });
    populateResidentList( residents );
}

function populateResidentList( data )
{
    clearResidentList();
    for (let resident of data) {
        let row = document.createElement('div');
        row.classList.add('row');
        row.classList.add('planet-row');
        row.appendChild(constructTextColumn(resident.name, 2));
        row.appendChild(constructTextColumn(`${Number(resident.height)/100} m`));
        row.appendChild(constructTextColumn(`${resident.mass} kg`));
        row.appendChild(constructTextColumn(resident.skin_color));
        row.appendChild(constructTextColumn(resident.hair_color));
        row.appendChild(constructTextColumn(resident.eye_color));
        row.appendChild(constructTextColumn(resident.birth_year));
        row.appendChild(constructTextColumn(
            resident.gender === "male" ? "♂" :
                resident.gender === "female" ? "♀" :
                    resident.gender
        ));
    }
    $('#residentsModal').modal();
    stopLoading();
}

function populatePlanetList( data )
{
    console.log("populating resident list");
    clearPlanetList();
    let planetList = document.getElementById('planet-list');
    planetList.dataset.next = JSON.stringify(data.next);
    planetList.dataset.previous = JSON.stringify(data.previous);
    document.getElementById('btn-next').disabled = data.next === null;
    document.getElementById('btn-previous').disabled = data.previous === null;
    for (let planet of data.results) {
        let row = document.createElement('div');
        row.classList.add('row');
        row.classList.add('planet-row');
        row.appendChild(constructTextColumn(planet.name));
        row.appendChild(constructTextColumn(
            planet.diameter.includes("unknown") ? "unknown" :
            `${Number(planet.diameter).toLocaleString()} km`));
        row.appendChild(constructTextColumn(planet.climate));
        row.appendChild(constructTextColumn(planet.terrain,3));
        row.appendChild(constructTextColumn(
            planet.surface_water.includes("unknown") ? "unknown" :
                `${planet.surface_water}%`,
            1));
        row.appendChild(constructTextColumn(
            planet.population.includes("unknown") ? "unknown" :
                `${Number(planet.population).toLocaleString()} people`,
            2));
        row.appendChild(constructButtonColumn(
            `${planet.residents.length} resident(s)`,
            ["btn-residents", "btn", "btn-sm", "btn-secondary"],
            {residents: planet.residents},
            2
            ));
        row.appendChild(constructButtonColumn(
            `Vote`,
            ["btn-vote-planet"]
            ));
        document.getElementById('planet-list').appendChild(row);
    }
    stopLoading();
}

function clearPlanetList()
{
    removeElementsByClassName( 'planet-row' );
}

function clearResidentList()
{
    document.getElementById('residentsModalLabel').innerText = "";
    removeElementsByClassName( 'resident-row' );
}

function removeElementsByClassName( className )
{
    let elements = document.getElementsByClassName( className );
    for (let i = elements.length; i > 0; i --) {
        elements[i-1].remove();
    }
}

function constructTextColumn(content, relativeWidth=1, collapseThreshold='xl')
{
    let column = document.createElement('div');
    column.classList.add(`col-${collapseThreshold}-${relativeWidth}`);
    column.innerText = content.toString();
    return column
}

function constructButtonColumn(title, classList = [], dataset={}, relativeWidth=1, collapseThreshold='xl')
{
    let column = document.createElement('div');
    column.classList.add(`col-${collapseThreshold}-${relativeWidth}`);
    let button = document.createElement('button');
    button.innerText = title;
    for (let index in dataset) button.dataset[index] = JSON.stringify(dataset[index]);
    for (let classItem of classList) button.classList.add(classItem);
    column.appendChild(button);
    return column
}

function startLoading() {
    document.getElementById('btn-next').disabled = true;
    document.getElementById('btn-previous').disabled = true;
    if (!document.getElementById('loading-icon')) {
        let loadingIcon = document.createElement('img');
        loadingIcon.id = 'loading-icon';
        loadingIcon.src = 'https://i.gifer.com/4V0b.gif';
        document.getElementById('planet-list').appendChild(loadingIcon);
    }
}

function stopLoading() {
    let loadingIcon = document.getElementById('loading-icon');
    if (loadingIcon) {
        loadingIcon.remove();
    }
}

function planetListClick(event) {
    if (event.target.disabled !== true) {
        if (event.target.id.toString() === 'btn-next') {
            listPlanets(JSON.parse(event.currentTarget.dataset.next));
        } else if (event.target.id.toString() === 'btn-previous') {
            listPlanets(JSON.parse(event.currentTarget.dataset.previous));
        } else if (event.target.classList.contains('btn-residents')) {
            listResidents( JSON.parse(event.target.dataset.residents) );
            document.getElementById('residentsModalLabel').innerText = "";
        }
    }
}

function main()
{
    document.getElementById('planet-list').addEventListener('click', planetListClick);
    listPlanets();
}

main();