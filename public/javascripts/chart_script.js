/*!
 * Chart_script.js
 * Author       : Bestwebcreator.
 * Template Name: Cryptocash – ICO, Cryptocurrency Website & ICO Landing Page HTML + Dashboard Template
 * Version      : 1.7
*/
var config = {
	type    : 'doughnut',
	data    : {
		datasets : [
			{
				data            : [
					35,
					5,
					45,
					5,
					10
				],
				backgroundColor : [
					'#f69040',
					'#017cff',
					'#0fadc9',
					'#f17877',
					'#5b5da8'
				],
				borderColor     : [
					'rgba(255,255,255,0.5)',
					'rgba(255,255,255,0.5)',
					'rgba(255,255,255,0.5)',
					'rgba(255,255,255,0.5)',
					'rgba(255,255,255,0.5)'
				],
				borderWidth     : 1,
				label           : 'Dataset 1'
			}
		],
		labels   : [
			'Marketing',
			'Management Team',
			'Project Development',
			'Legal Procedures',
			'Prize Fund'
		]
	},
	options : {
		responsive : true,
		legend     : {
			display : false
		},
		title      : {
			display : false,
			text    : 'Chart.js Doughnut Chart'
		},
		pieceLabel : {
			render    : 'percentage',
			fontColor : [
				'#f69040',
				'#017cff',
				'#0fadc9',
				'#f17877',
				'#5b5da8'
			],
			fontSize  : 16,
			fontStyle : 'bold',
			position  : 'outside',
			precision : 2
		},
		animation  : {
			animateScale  : true,
			animateRotate : true
		}
	}
};

var config2 = {
	type    : 'doughnut',
	data    : {
		datasets : [
			{
				data            : [
					75,
					20,
					5
				],
				backgroundColor : [
					'#79c596',
					'#0fadc9',
					'#f17877'
				],
				borderColor     : [
					'rgba(255,255,255,0.5)',
					'rgba(255,255,255,0.5)',
					'rgba(255,255,255,0.5)'
				],
				borderWidth     : 1,
				label           : 'Dataset 1'
			}
		],
		labels   : [
			'ICO Sales',
			'Development team',
			'Airdrop & Bounty'
		]
	},
	options : {
		responsive : true,
		legend     : {
			display : false
		},
		title      : {
			display : false,
			text    : 'Chart.js Doughnut Chart'
		},
		pieceLabel : {
			render    : 'percentage',
			fontColor : [
				'#79c596',
				'#0fadc9',
				'#f17877'
			],
			fontSize  : 16,
			fontStyle : 'bold',
			position  : 'outside',
			precision : 2
		},
		animation  : {
			animateScale  : true,
			animateRotate : true
		}
	}
};

window.onload = function() {
	var ctx = document.getElementById('token_sale').getContext('2d');
	window.myPie = new Chart(ctx, config);
	var ctx2 = document.getElementById('token_dist').getContext('2d');
	window.myPie = new Chart(ctx2, config2);
};
