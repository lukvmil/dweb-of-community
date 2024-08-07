// import "./cytoscape.js"
// import { cytoscapeFcose } from "./cytoscape-fcose.js"
import "./cytoscape.js";


var cy = cytoscape({
    container: document.getElementById("cy"),
    elements: [
        {
            data: {
                id: "a",
                name: "Luke Miller",
                color: "red"
            }
        },
        {
            data: {
                id: "b",
                name: "Orion Reed",
                color: "red"
            }
        },
        {
            data: {
                id: "ab",
                source: "a",
                target: "b"
            }
        }
    ],
    style: [
        {
            selector: "node",
            style: {
                'background-color': 'data(color)',
                label: 'data(name)'
            }
        }
    ]
})


for (var i = 0; i < 10; i++) {
    cy.add({
        data: { id: 'node' + i }
        }
    );
    var source = 'node' + i;
    cy.add({
        data: {
            id: 'edge' + i,
            name: "test",
            color: "blue",
            source: source,
            target: (i % 2 == 0 ? 'a' : 'b')
        }
    });
}

cy.layout({
    name: "cose"
}).run();
