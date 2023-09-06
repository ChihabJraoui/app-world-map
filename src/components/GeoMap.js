import React, {useEffect} from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldMoroccoLow';
import am4themes_dark from '@amcharts/amcharts4/themes/frozen';
import isEmpty from 'lodash/isEmpty';
import {isNotEmpty} from '@amcharts/amcharts4/.internal/core/utils/Utils';
import {getCountryName, getCountryShortCode} from "../constants/countries";

function GeoMap(props) {

    const {
        data,
        filters = [],
    } = props;

    /**
     * Map patents data
     *
     * @returns {*}
     */
    function getPatentsData() {

        return data?.map((item) => ({
            id: getCountryShortCode(item.ISO3),
            name: getCountryName(item.ISO3),
            value: item.patents_raw,
        }));
    }

    // function getPapersData() {
    //
    //     //Get positive data (> 0)
    //     return data?.map((item) => ({
    //         id: getCountryShortCode(item.ISO3),
    //         name: getCountryName(item.ISO3),
    //         value: item.papers_raw,
    //     }));
    // }

    // create the chart
    function init() {

        am4core.useTheme(am4themes_dark);

        // create container
        const container = am4core.create("world-map-chart", am4core.Container);

        container.background.fill = '#DCE3F4';
        container.width = am4core.percent(100);
        container.height = am4core.percent(100);

        // Create map instance
        const chart = container.createChild(am4maps.MapChart);
        chart.geodata = am4geodata_worldLow; // Set map definition
        chart.projection = new am4maps.projections.Miller(); // Set projection
        // mapChart.numberFormatter.bigNumberPrefixes = numberSuffix;

        // Create map polygon series
        const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
        polygonSeries.useGeodata = true;
        polygonSeries.exclude = ['AQ'];
        polygonSeries.data = getPatentsData();

        // Add heat rules (dynamically fill country)
        polygonSeries.heatRules.push({
            property: 'fill',
            target: polygonSeries.mapPolygons.template,
            min: am4core.color('#e69eda'),
            max: am4core.color('#A3278F'),
        });

        // Configure series
        const polygonTemplate = polygonSeries.mapPolygons.template;
        polygonTemplate.stroke = am4core.color('#DCE3F4');
        polygonTemplate.strokeWidth = 1;
        polygonTemplate.strokeOpacity = 0.4;
        polygonTemplate.fill = am4core.color('#FFFFFF');

        // Tooltip
        polygonTemplate.tooltipText = `{name}
        \n[font-size:12px]Patents:[/] [bold]{value}[/]`;
        polygonSeries.tooltip.getFillFromObject = false;
        polygonSeries.tooltip.background.fill = am4core.color(`#000`);
        polygonSeries.tooltip.label.fontSize = 14;
        polygonSeries.tooltip.background.strokeWidth = 0;

        // Legend
        const heatLegend = chart.chartContainer.createChild(am4maps.HeatLegend);
        heatLegend.valign = 'bottom';
        heatLegend.align = 'left';
        heatLegend.width = am4core.percent(100);
        heatLegend.series = polygonSeries;
        heatLegend.orientation = 'vertical';
        heatLegend.padding(20, 20, 20, 20);
        heatLegend.margin(0, 0, isNotEmpty(filters) ? 60 : 10, 0);
        heatLegend.valueAxis.renderer.labels.template.fontSize = 15;
        heatLegend.valueAxis.renderer.minGridDistance = 40;
        heatLegend.valueAxis.renderer.labels.template.fill = am4core.color('#5E6175');
        heatLegend.valueAxis.tooltip.label.fill = am4core.color('#FFFFFF');
        heatLegend.valueAxis.tooltip.background.strokeWidth = 0;

        // Legend effects
        polygonSeries.mapPolygons.template.events.on('over', (event) => {
            if (!isNaN(event.target.dataItem.value)) {
                heatLegend.valueAxis.showTooltipAt(event.target.dataItem.value);
            } else {
                heatLegend.valueAxis.hideTooltip();
            }
        });
        polygonSeries.mapPolygons.template.events.on('out', (event) => {
            heatLegend.valueAxis.hideTooltip();
        });

        // Country hover: Create hover state and set alternative fill color
        const hoverState = polygonTemplate.states.create('hover');
        hoverState.properties.fill = am4core.color('#B3ABEA');

        // Zoom panel
        chart.zoomControl = new am4maps.ZoomControl();
        chart.zoomControl.align = 'left';
        chart.zoomControl.valign = 'top';
        chart.zoomControl.dy = 80;
        chart.zoomControl.dx = 10;
        chart.zoomControl.fontSize = 20;
        chart.zoomControl.plusButton.label.fill = '#fff';
        chart.zoomControl.minusButton.label.fill = '#fff';
        chart.zoomControl.width = 45;
        chart.zoomControl.height = 45;
        chart.zoomControl.fontWeight = 'bold';
        chart.zoomControl.plusButton.background.fill = '#525252';
        chart.zoomControl.minusButton.background.fill = '#525252';
        chart.zoomControl.minusButton.events.on('hit', () => chart.goHome());
        chart.zoomEasing = am4core.ease.sinOut;

        return container;
    }

    useEffect(() => {
        if (!isEmpty(data)) {
            const map = init();

            return () => {
                map.dispose();
            };
        }
    }, [data]);

    return (
        <div id="world-map-chart" style={{height: "500px"}}></div>
    );
}

export default GeoMap;