import NavigationGraph from "../NavigationGraph";

describe('NavigationGraph', () => {
    test('createNode', () => {
        const graph = new NavigationGraph();
        graph.createNode('A');
        graph.createNode('B');
        expect(graph.nodes.length).toBe(2);
        expect(graph.nodes[0].name).toBe('A');
        expect(graph.nodes[1].name).toBe('B');
    });

    test('createEdge', () => {
        const graph = new NavigationGraph();
        graph.createNode('A');
        graph.createNode('B');
        graph.addEdge('A', 'B', 5);
        expect(graph.nodes[0].neighbours.get('B')).toBe(5);
    });

    describe('getShortestPath', () => {
        test('linear path', () => {
            const graph = new NavigationGraph();
            graph.createNode('A');
            graph.createNode('B');
            graph.createNode('C');
            graph.createNode('D');
            graph.addEdge('A', 'B', 5);
            graph.addEdge('B', 'C', 5);
            graph.addEdge('C', 'D', 5);
            const path = graph.getShortestPath('A', 'D');
            expect(path).toEqual(['A', 'B', 'C', 'D']);
        });

        test('branching path', () => {
            const graph = new NavigationGraph();
            graph.createNode('A');
            graph.createNode('B');
            graph.createNode('C');
            graph.createNode('D');
            graph.createNode('E');

            graph.addEdge('A', 'B', 1);
            graph.addEdge('A', 'C', 2);
            graph.addEdge('A', 'D', 6);
            graph.addEdge('B', 'D', 2);
            graph.addEdge('C', 'D', 2);
            graph.addEdge('D', 'E', 1);

            const path = graph.getShortestPath('A', 'D');
            expect(path).toEqual(['A', 'B', 'D']);
        })
    });
})