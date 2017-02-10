
			function indicatorChart1() {
				$('#indicatorchart').highcharts({
					chart: {
						type: 'column',
						events:{
							load: function()
							{
								setTimeout(function(){
									$(document).resize();
									},500);
							}
						}
					},
					credits: {
						enabled: false
					},
					exporting: {
						enabled: false
					},
					title: {
						text: ''
					},
					subtitle: {
						text: ''
					},
					xAxis: {
						categories: [
						'San Francisco',
						'New York',
						'Kingston',
						'Sao Paulo',
						'Dakar',
						'Paris',
						'Nairobi',
						'Durban',
						'Mumbai',
						'Bangkok',
						'Quezon City',
						'Melbourne'
						]
					},
					yAxis: {
						min: 0,
						title: {
							text: 'Population (millions)'
						}
					},
					tooltip: {
						headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
						pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
						'<td style="padding:0"><b>{point.y:.1f} millions</b></td></tr>',
						footerFormat: '</table>',
						shared: true,
						useHTML: true
					},
					plotOptions: {
						column: {
							pointPadding: 0.2,
							borderWidth: 0
						}
					},
					series: [{
						name: 'Population',
						data: [8.3, 8.4, 1.1, 11.32, 1.05, 2.2, 3.13, 3.46, 19.78, 6.35, 2.67, 4.07]
						
					}]
				});
			}
		
		
		
		function indicatorChart2() {
				$('#overlaychart').highcharts({
					chart: {
						type: 'column'
					},
					credits: {
						enabled: false
					},
					exporting: {
						enabled: false
					},
					title: {
						text: ''
					},
					subtitle: {
						text: ''
					},
					xAxis: {
						categories: [
						'San Francisco',
						'New York',
						'Kingston',
						'Sao Paulo',
						'Dakar',
						'Paris',
						'Nairobi',
						'Durban',
						'Mumbai',
						'Bangkok',
						'Quezon City',
						'Melbourne'
						]
					},
					yAxis: {
						min: 0,
						title: {
							text: 'Death by TB (millions)'
						}
					},
					tooltip: {
						headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
						pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
						'<td style="padding:0"><b>{point.y:.1f} millions</b></td></tr>',
						footerFormat: '</table>',
						shared: true,
						useHTML: true
					},
					plotOptions: {
						column: {
							pointPadding: 0.2,
							borderWidth: 0
						}
					},
					series: [{
						name: 'Death by TB',
						data: [1.3, 1.4, 2.1, 2.5, 0.95, 1.2, 3.13, 3.46, 4.98, 2.35, 2.67, 2.07]
						
					}]
				});
			}
		
		
			