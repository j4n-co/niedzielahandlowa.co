const closedDays = require( './dates.json' );
const monthNames = {
	1:'Styczeń',
	2:'Luty',
	3:'Marzec',
	4:'Kwiecień',
	5:'Maj',
	6:'Czerwiec',
	7:'Lipiec',
	8:'Sierpień',
	9:'Wrzesień',
	10:'Październik',
	11:'listopad',
	12:'Grudzień'
}

const fs = require( 'fs' );

class FancyDate {
	constructor( dateString, closedDates ) {
		var closedDates = closedDates || [];
		this.now = new Date();
		this.Date = new Date( dateString );
		this.isOpen = closedDates.indexOf( this.Date.toUTCString() ) > -1;
	}

	get month() { return this.Date.getUTCMonth() + 1; }
	get dayOfMonth(){ return this.Date.getUTCDate(); }
	get dayOfWeek() { return ( this.Date.getUTCDay() === 0 ) ? 7 : this.Date.getUTCDay() ; }
	get year() { return this.Date.getUTCFullYear(); }
	get tomorrow() { return new Date( this.Date.getTime() + (24 * 60 * 60 * 1000) ) }
	get isSunday() {  return this.dayOfWeek === 7 };
	get isToday() {

		var bool = ( this.now.getUTCFullYear() === this.Date.getUTCFullYear() )
		&& (this.now.getUTCMonth() === this.Date.getUTCMonth() )
		&& ( this.now.getUTCDate() === this.Date.getUTCDate() );
		return bool;
	}

}


function range( start, end ) {
	return Array.from(Array(end - start + 1).keys()).map(i => i + start);
};

function daysInRange( startDate, endDate ) {

	var ONE_DAY = 1000 * 60 * 60 * 24,
		msStart = startDate.getTime(),
		msEnd = endDate.getTime(),
		msDifference = Math.abs(msStart - msEnd);
	return Math.round(msDifference/ONE_DAY)
}

const data = createCalendarData( 'March 1 2018 00:00:00 GMT+00:00', 'December 31 2019 00:00:00 GMT+00:00', closedDays )

function createCalendarData( start, end, closedDays ) {

	var startDate = new FancyDate( start );
	var endDate = new FancyDate( end );
	var numberOfDays = daysInRange( startDate.Date, endDate.Date );
	var tmpDate = new FancyDate( start );
	var data = {};

	range(0, numberOfDays).forEach( () => {
		var year = tmpDate.year;
		var month = tmpDate.month;

		if ( data[year] === undefined ) {
			data[year] = {};
		}

		if ( data[year][month] === undefined ) {
			data[year][month] = [];
		}

		data[year][month].push( tmpDate );
		tmpDate = new FancyDate( tmpDate.tomorrow, closedDays );

	});
	return data;
}

function calendarTemplate( calendarData ) {
	var tmp = '';
	tmp += `
	<div>`;
	tmp += Object.keys( calendarData ).reduce( ( tmp, year ) => {
		tmp += `
		<label for="calendar-${year}">${year}</label>
		`;
		return tmp;
	}, '' );
	tmp += `
	</div>
	`;
	tmp += Object.keys( calendarData ).reduce( ( tmp, year ) => {
		const yearData = calendarData[year];
		tmp += Object.keys( yearData ).reduce( (tmp, month, i) => {
			const monthData = yearData[month];
			const monthId = `${year}-${month}`;

			let nextMonthId = `${year}-${parseInt(month)+1}`;
			let prevMonthId = `${year}-${parseInt(month)-1}`
			if ( ( parseInt( month ) + 1 ) > 12 ) {
				nextMonthId = `${parseInt(year) + 1}-1`;
			}
			if ( ( parseInt( month ) - 1 ) < 1 ) {
				prevMonthId = `${parseInt(year) - 1}-12`;
			}

			return tmp += `
		<time class="calendar-unit" id="${monthId}" datetime="${monthId}">
			<h3 class="month-name">
				Niedziele handlowe <b>${monthNames[ month ]} ${year}</b>
			</h3>
			<a class="month-prev-link" href="#${prevMonthId}"></a>
			<a class="month-next-link" href="#${nextMonthId}"></a>
			<div class="calendar">
			${ monthData.reduce( (tmp, day) => {
				var classList = [];
				var classAttr = '';
				var styleAttr = '';
				if ( day.isSunday && day.isOpen  ) {
					classList.push( 'open' );
				} else if ( day.isSunday ) {
					classList.push( 'closed' )
				}
				if ( day.dayOfMonth === 1 ) {
					styleAttr = `style="grid-column-start: ${day.dayOfWeek};"`
				}
				if ( day.isToday ) {
					classList.push( 'today' )
				}
				if ( classList.length ) {
					classAttr = `class="${classList.join(' ')}"`;
				}

				return tmp += `
				<time datetime="${day.year}-${day.month}-${day.dayOfMonth}" ${classAttr} ${styleAttr}>${day.dayOfMonth}</time>`
			}, '' ) }
			</div>
		</time>
		`;
		}, '')
		return tmp;
	}, '');
	return tmp;
}

function htmlTemplate( innerTemplate ) {
	return `
<!DOCTYPE html>
<html lang="pl">
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>Niedziela Handlowa</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" type="text/css" media="screen" href="main.css" />
	<script>
	function onLoad(el) {
		var now = new Date();
		var id =  now.getFullYear() + '-' + ( now.getMonth() + 1 );
		var el = document.getElementById( id );
		el.scrollIntoView( false );
	}
</script>
</head>
<body onload="onLoad()">
	<h1 class="headline">
		Czy sklepy będą jutro otwarte?
	</h1>
	<h2 class="yesno no">
		NIE!
	</h2>
	<div class="calendar-scroll-container">
${innerTemplate}
	</div>

	<div class="month-links">
		<h4 class="subheading">2018</h4>
		<a class="month-link" href="">01</a>
		<a class="month-link" href="">02</a>
		<a class="month-link" href="">03</a>
		<a class="month-link" href="">04</a>
		<a class="month-link" href="">05</a>
		<a class="month-link" href="">06</a>
		<a class="month-link" href="">07</a>
		<a class="month-link" href="">08</a>
		<a class="month-link" href="">09</a>
		<a class="month-link" href="">10</a>
		<a class="month-link" href="">11</a>
		<a class="month-link" href="">12</a>
	</div>
</div>
</body>
</html>
`;
}

var calendarTmpl = calendarTemplate( data );
var htmlTmpl = htmlTemplate( calendarTmpl )

fs.writeFileSync( 'test.html', htmlTmpl );

