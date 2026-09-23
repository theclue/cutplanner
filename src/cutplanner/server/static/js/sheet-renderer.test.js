import test from 'node:test';
import assert from 'node:assert/strict';
import { fitPanelLabel, renderSheet } from './sheet-renderer.js';

globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
};

test('keeps a wide panel horizontal and sizes the label in viewBox units', () => {
    const fit = fitPanelLabel('Shelf', 500, 100);
    assert.equal(fit.rotation, 0);
    assert.ok(fit.fontSize <= 12);
});

test('rotates a narrow, tall panel CCW with complete labels', () => {
    const fit = fitPanelLabel('Zoccolo fronte', 100, 500);
    assert.equal(fit.rotation, -90);
    assert.equal(fit.text, 'Zoccolo fronte');
    assert.ok(fit.fontSize <= 12);
    assert.equal(fitPanelLabel('Traversa retro', 100, 500).text, 'Traversa retro');
});

test('keeps a square panel horizontal', () => {
    assert.equal(fitPanelLabel('Shelf', 200, 200).rotation, 0);
});

test('rotation candidate remains within the visual font cap', () => {
    const rotated = fitPanelLabel('Zoccolo fronte', 100, 500);
    const horizontal = fitPanelLabel('Zoccolo fronte', 100, 100);
    assert.equal(rotated.rotation, -90);
    assert.ok(rotated.fontSize >= horizontal.fontSize);
    assert.ok(rotated.fontSize <= 12);
});

test('reduces the font before truncating a label', () => {
    const fit = fitPanelLabel('A very long panel name', 160, 80);
    assert.ok(fit.fontSize <= 12);
    assert.doesNotMatch(fit.text, /…$/);
});

test('truncates only as an extreme fallback', () => {
    const fit = fitPanelLabel('A very long panel name', 40, 40);
    assert.ok(fit.fontSize >= 6);
    assert.match(fit.text, /…$/);
});

test('omits dimensions when the panel has no room', () => {
    assert.equal(fitPanelLabel('Panel', 20, 20).showDimensions, false);
});

test('emits CCW rotation and clip paths without legacy clockwise rotation', () => {
    const { html } = renderSheet({
        width: 1000,
        height: 1000,
        utilization_percent: 10,
        label: 'Test sheet',
        placed_panels: [{
            x: 0,
            y: 0,
            rotated: false,
            panel: { id: 'p1', name: 'Panel', width: 40, length: 500 },
        }],
    }, 1);

    assert.match(html, /rotate\(-90 /);
    assert.match(html, /clip-path="url\(#panel-clip-1\)"/);
    assert.doesNotMatch(html, /rotate\(90 /);
});

test('omits dimensions when the full dimensions row does not fit', () => {
    const fit = fitPanelLabel('Panel', 20, 20);
    assert.equal(fit.showDimensions, false);
});

test('keeps equivalent square fits horizontal', () => {
    const fit = fitPanelLabel('Square label', 200, 200);
    assert.equal(fit.rotation, 0);
});
