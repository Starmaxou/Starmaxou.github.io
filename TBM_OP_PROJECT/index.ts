
declare var CUB: any;

// Couches restantes à charger
let remaining = 10;
let loadingPanel;
let refreshTime = 10000;

CUB.ready(() => {
    // Initialisation de l'API CUB
    CUB.init(document.getElementById('map'), {
        extent: [1411539.71, 4185738.74, 1424239.7, 4192214.41]
    });

    // Création du Panel conteneur de la mire
    loadingPanel = new CUB.Panel({
        width: 48,
        height: 48,
        top: CUB.getHeight() / 2 - 24,
        left: CUB.getWidth() / 2 - 24,
        content: '<img src="//data.bordeaux-metropole.fr/dev/exemples/samples/loading.gif" style="border: 1px solid black"/>'
    });

    // Chargement des lignes de tram
    
    const lignes = [
        { ligneGid: 59, nom: 'Ligne A', label: 'A', color: '#81197F' },
        { ligneGid: 60, nom: 'Ligne B', label: 'B', color: '#DA003E' },
        { ligneGid: 61, nom: 'Ligne C', label: 'C', color: '#D15094' },
        { ligneGid: 62, nom: 'Ligne D', label: 'D', color: '#91619D' }
    ]

    const lignes_bus = [
        { ligneGid: 6, nom: 'Liane 8', label: '8', color: '#3A95CB' }
    ]
    
    for(const ligne of lignes) {
        createLigne(ligne.ligneGid, ligne.nom, ligne.color);
        createVehicule(ligne.ligneGid, ligne.label, ligne.color);
    }

    for(const ligne of lignes_bus) {
        createLigne(ligne.ligneGid, ligne.nom, ligne.color);
        createBus(ligne.ligneGid, ligne.label, ligne.color);
        CheminBus(ligne.ligneGid, ligne.label, ligne.color);
    }
});


/**
 * Charge une ligne de tram sur la carte
 * @param ligneGid GID de la ligne
 * @param nom 
 */
function createLigne(ligneGid: number, nom: string, color: string) {
    const layer = new CUB.Layer.Dynamic(nom, '//data.bordeaux-metropole.fr/wfs?key=11DGGILLWZ', {
        layerName: 'SV_CHEM_L',
        // Filtre sur l'ID de la ligne + uniquement les chemins principaux
        wfsFilter: `<And><PropertyIsEqualTo><PropertyName>RS_SV_LIGNE_A</PropertyName><Literal>${ligneGid}</Literal></PropertyIsEqualTo><PropertyIsEqualTo><PropertyName>PRINCIPAL</PropertyName><Literal>1</Literal></PropertyIsEqualTo></And>`,
        propertyname: ['GID', 'LIBELLE'],
        loadAllAtOnce: true,
        style: new CUB.Style({ // Style par défaut
            color: new CUB.Color(color)
        })
    });

    // Callback de fin de chargement
    layer.onLoadEnd = () => onLayerLoadEnd(layer);

    return layer;
}

/**
 * Crée la couche des véhivules
 */
function createVehicule(ligneGid: number, label: string, color: string) {
    const layer = new CUB.Layer.Dynamic('Tram ' + label, '//data.bordeaux-metropole.fr/wfs?key=11DGGILLWZ', {
        layerName: 'SV_VEHIC_P',
        // Filtre sur l'ID de la ligne + uniquement les chemins principaux
        wfsFilter: `<PropertyIsEqualTo><PropertyName>RS_SV_LIGNE_A</PropertyName><Literal>${ligneGid}</Literal></PropertyIsEqualTo>`,
        propertyname: ['GEOM', 'TERMINUS','VITESSE'],
        loadAllAtOnce: true,
        refreshInterval: refreshTime,
        style: new CUB.Style({ // Style par défaut
            symbol: `https://data.bordeaux-metropole.fr/opendemos/assets/images/saeiv/tram_${label.toLowerCase()}.png`,
            opacity: 100,
            size: 10,
            labelColor: new CUB.Color(color),
            labelOutlineWidth: 1.5,
            labelSize: 12,
            labelBold: true,
            label: '${TERMINUS}'+'\n'+'${VITESSE}'+'km/h', // Libellé de l'étiquette	
            labelYOffset: -15,
            labelMaxScaledenom: 25000
        })
    });
}

function createBus(ligneGid: number, label: string, color: string) {
    const layer = new CUB.Layer.Dynamic('Bus ' + label, '//data.bordeaux-metropole.fr/wfs?key=11DGGILLWZ', {
        layerName: 'SV_VEHIC_P',
        // Filtre sur l'ID de la ligne + uniquement les chemins principaux
        wfsFilter: `<PropertyIsEqualTo><PropertyName>RS_SV_LIGNE_A</PropertyName><Literal>${ligneGid}</Literal></PropertyIsEqualTo>`,
        propertyname: ['GEOM', 'TERMINUS','VITESSE'],
        loadAllAtOnce: true,
        refreshInterval: refreshTime,
        style: new CUB.Style({ // Style par défaut
            symbol: `Pictures/Bus/Logo_Bus_Bordeaux_ligne_${label}.png`,
            opacity: 100,
            size: 10,
            labelColor: new CUB.Color(color),
            labelOutlineWidth: 1.5,
            labelSize: 12,
            labelBold: true,
            label: '${TERMINUS}'+'\n'+'${VITESSE}'+'km/h', // Libellé de l'étiquette	
            labelYOffset: -15,
            labelMaxScaledenom: 25000
        })
    });
}

function CheminBus(ligneGid: number, label: string, color: string){
    const layer_chemin = new CUB.Layer.Dynamic('Chemin Bus '+ label, '//data.bordeaux-metropole.fr/wfs?key=11DGGILLWZ', {
        layerName: 'SV_CHEMIN_L',
        wfsFilter: `<PropertyIsEqualTo><PropertyName>RS_SV_LIGNE_A</PropertyName><Literal>${ligneGid}</Literal></PropertyIsEqualTo>`,
        propertyname: ['GID']
    })

    const layer_arret = new CUB.Layer.Static('Arret Bus '+ label, '//data.bordeaux-metropole.fr/wps?key=11DGGILLWZ', {
        idenifier: 'saeiv_arrets_chemin',
        gid: layer_chemin.propertyname[0],
        propertyname: ['GEOM','libelle'],
        loadAllAtOnce: true,
        style: new CUB.Style({ // Style par défaut
            symbol: `Pictures/Bus/Logo_Bus_Bordeaux_ligne_${label}.png`,
            opacity: 100,
            size: 5,
            labelColor: new CUB.Color(color),
            labelOutlineWidth: 1.5,
            labelSize: 12,
            labelBold: true,
            label: '${libelle}', // Libellé de l'étiquette	
            labelYOffset: -15,
            labelMaxScaledenom: 25000
        })
    })
}

/**
 * Fin de chargement d'une couche WFS
 * @param layer La couche WFS
 */
function onLayerLoadEnd(layer) {
    --remaining;

    if(remaining === 0)
        loadingPanel.disable();
}