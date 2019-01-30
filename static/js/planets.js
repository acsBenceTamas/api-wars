const ERROR_ALREADY_VOTED = -1;
const SUCCESS_VOTE_ADDED = 1;
const ERROR_LOGIN_REQUIRED = -6;

function listPlanets( apiTarget )
{
    const apiPage = new URL(apiTarget).searchParams.get("page");
    const url = new URL(window.location.href);
    url.searchParams.set("page", apiPage);
    history.replaceState(history.state, `page ${apiPage}`, url);
    startLoading();
    fetch(apiTarget)
    .then((response) => response.json())
    .then((data) => {
        populatePlanetList(data);
    })
}

function listResidents( apiTargetList, planetName )
{
    startLoading();
    let residents = [];
    let promises = [];
    for (let apiTarget of apiTargetList) {
        let promise = fetch(apiTarget)
        .then((response) => response.json())
        .then((data) => {
            residents.push(data);
        });
        promises.push(promise);
    }
    Promise.all(promises).then(x => populateResidentList( residents, planetName ))
}

function populateResidentList( data, planetName )
{
    clearResidentList();
    let secondaryRow = true;
    for (let resident of data) {
        let row = document.createElement('div');
        row.classList.add('row');
        row.classList.add('resident-row');
        if (secondaryRow) row.classList.add('bg-secondary');
        secondaryRow = !secondaryRow;
        row.appendChild(constructTextColumn(resident.name, 0));
        row.appendChild(constructTextColumn(
            isNaN(resident.height) ?
                "unknown":
                `${Number(resident.height)/100} m`
        ));
        row.appendChild(constructTextColumn(
            isNaN(resident.mass) ?
                "unknown":
                `${resident.mass} kg`
        ));
        row.appendChild(constructTextColumn(resident.skin_color));
        row.appendChild(constructTextColumn(resident.hair_color));
        row.appendChild(constructTextColumn(resident.eye_color));
        row.appendChild(constructTextColumn(resident.birth_year));
        row.appendChild(constructTextColumn(
            resident.gender === "male" ? "♂" :
                resident.gender === "female" ? "♀" :
                    resident.gender
        ));
        document.getElementById('resident-list').appendChild(row);
    }
    document.getElementById('residentsModalLabel').innerText = `Residents of ${planetName}`;
    $('#residentsModal').modal();
    stopLoading();
}

function populatePlanetList( data )
{
    clearPlanetList();
    let planetList = document.getElementById('planet-list');
    planetList.dataset.next = JSON.stringify(data.next);
    planetList.dataset.previous = JSON.stringify(data.previous);
    let secondaryRow = true;
    for (let planet of data.results) {
        let row = document.createElement('div');
        row.classList.add('row');
        row.classList.add('planet-row');
        row.dataset.planetInfo = JSON.stringify({name: planet.name, id: getIdFromURL(planet.url)});
        if (secondaryRow) {row.classList.add('bg-secondary')} else {row.classList.add('bg-light')}
        secondaryRow = !secondaryRow;
        row.appendChild(constructTextColumn(planet.name));
        row.appendChild(constructTextColumn(
            planet.diameter.includes("unknown") ? "unknown" :
            `${Number(planet.diameter).toLocaleString()} km`));
        row.appendChild(constructTextColumn(planet.climate,0));
        row.appendChild(constructTextColumn(planet.terrain,0));
        row.appendChild(constructTextColumn(
            planet.surface_water.includes("unknown") ? "unknown" :
                `${planet.surface_water}%`,
            1));
        row.appendChild(constructTextColumn(
            planet.population.includes("unknown") ? "unknown" :
                `${Number(planet.population).toLocaleString()} people`,
            2));
        if (planet.residents.length > 0) {
            row.appendChild(constructButtonColumn(
                `${planet.residents.length} resident(s)`,
                ["btn-residents", "btn", "btn-sm", "btn-secondary"],
                {residents: planet.residents, name: planet.name},
                2
                ));
        } else {
            row.appendChild(constructTextColumn("No known residents", 2));
        }
        if (document.getElementById('server-data-container').dataset.user) {
            row.appendChild(constructButtonColumn(
                `Vote`,
                ["btn-vote-planet", "btn", "btn-sm", "btn-secondary"],
                {name: planet.name, id: getIdFromURL(planet.url)}
                ));
        }
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
    column.classList.add(getColType(relativeWidth, collapseThreshold));
    column.classList.add('column');
    column.innerText = content.toString();
    return column
}

function constructButtonColumn(title, classList = [], dataset={}, relativeWidth=1, collapseThreshold='xl', disabled= false)
{
    let column = document.createElement('div');
    column.classList.add(getColType(relativeWidth, collapseThreshold));
    column.classList.add('column');
    let button = document.createElement('button');
    button.innerText = title;
    button.disabled = disabled;
    for (let index in dataset) button.dataset[index] = JSON.stringify(dataset[index]);
    for (let classItem of classList) button.classList.add(classItem);
    column.appendChild(button);
    return column
}

function getColType(relativeWidth, collapseThreshold) {
    let colType = `col-${collapseThreshold}`;
    if (relativeWidth !== 0) colType += `-${relativeWidth}`;
    return colType
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
    let planetList = document.getElementById('planet-list');
    document.getElementById('btn-next').disabled = JSON.parse(planetList.dataset.next) === null;
    document.getElementById('btn-previous').disabled = JSON.parse(planetList.dataset.previous) === null;
}

function planetListClick(event) {
    if (event.target.disabled !== true) {
        if (event.target.id.toString() === 'btn-next') {
            listPlanets(JSON.parse(event.currentTarget.dataset.next));
        } else if (event.target.id.toString() === 'btn-previous') {
            listPlanets(JSON.parse(event.currentTarget.dataset.previous));
        } else if (event.target.classList.contains('btn-residents')) {
            listResidents( JSON.parse(event.target.dataset.residents), JSON.parse(event.target.dataset.name) );
            document.getElementById('residentsModalLabel').innerText = "";
        } else if (event.target.classList.contains('btn-vote-planet')) {
            if (document.getElementById('login-info'))
            upvotePlanet( JSON.parse(event.target.dataset.name), Number(event.target.dataset.id) );
        }
    }
}

function upvotePlanet( planetName, planetId ) {
    let upvote = new FormData();
    upvote.set("planet_name", planetName);
    upvote.set("planet_id", planetId);
    fetch(
        '/upvote-planet/',
        {
            method: "POST",
            body: upvote
        }
        )
        .then((response) => response.json())
        .then((variable) => handleUpvote(variable));
}

function handleUpvote( response ) {
    let message = document.getElementById('planet-upvote-message');
    if (response === ERROR_ALREADY_VOTED) {
        message.innerText = "You already voted on this planet";
        message.classList.add('alert-warning');
        message.classList.remove('alert-success');
    } else if (response === SUCCESS_VOTE_ADDED) {
        message.innerText = "Your vote has been registered!";
        message.classList.add('alert-success');
        message.classList.remove('alert-warning');
    } else if (response === ERROR_LOGIN_REQUIRED) {
        message.innerText = "Login required to vote!";
        message.classList.add('alert-warning');
        message.classList.remove('alert-success');
    }
    $('#planet-upvote-message-modal').modal();
}

function updateOnLoginLogout() {
    let loginInfo = document.getElementById('login-info');
    if (loginInfo.dataset.username) {
        addVoteColumn()
    } else {
        removeVoteColumn();
    }
}

function removeVoteColumn() {
    let voteButtons = document.getElementsByClassName('btn-vote-planet');
    for (let i = voteButtons.length-1; i >= 0; i-- ) {
        voteButtons[i].closest(".column").remove()
    }
    document.getElementById('vote-column-header').remove()
}

function addVoteColumn() {
    if (!document.getElementById('vote-column-header')) {
        let header = constructTextColumn("");
        header.id = 'vote-column-header';
        document.getElementById('planet-list-header').appendChild(header);
        for (let row of document.querySelectorAll('#planet-list .planet-row')) {
            let planet = JSON.parse(row.dataset.planetInfo);
            row.appendChild(constructButtonColumn(
                `Vote`,
                ["btn-vote-planet", "btn", "btn-sm", "btn-secondary"],
                {name: planet.name, id: planet.id}
                ));
        }
    }
}

function getIdFromURL( url ) {
    let parts = url.split("/");
    return Number(parts[parts.length-2]);
}

function watchAttributeChanges( element, handler ) {
    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
        if (mutation.type.toString() === "attributes") {
            handler()
        }
        });
    });

    observer.observe(element, {
    attributes: true
    });
}

function main()
{
    document.getElementById('planet-list').addEventListener('click', planetListClick);
    const dataContainer = document.getElementById("server-data-container");
    listPlanets(`https://swapi.co/api/planets/?page=${dataContainer.dataset.page ? dataContainer.dataset.page: 1}`);
    let loginInfo = document.getElementById('login-info');
    watchAttributeChanges( loginInfo, updateOnLoginLogout );
}

main();