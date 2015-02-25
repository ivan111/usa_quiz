var usaquiz = (function ()
{

var
    STATES_KEYS,
    STATES_NUM,
    statesGeos = {},
    geographyConfig,
    lang = 'en',

    DEF_W = 1000,
    DEF_H = 500,
    FLAG_W = 247,
    FLAG_H = 130,
    FLAG_X = DEF_W - FLAG_W,
    FLAG_Y = DEF_H - FLAG_H,

    SCORE_X = DEF_W - 150,
    SCORE_Y = 50,

    MODE_ALL = 1,
    MODE_WEST = 2,
    MODE_MIDWEST = 3,
    MODE_NORTHEAST = 4,
    MODE_SOUTH = 5,

    MAX_MISTAKABLE = 3,
    MAX_SKIPPABLE = 3,

    REGIONS = [
        { label: 'ALL', label_ja: '全州', value: MODE_ALL, selected: true },
        { label: 'WEST', label_ja: '西部', value: MODE_WEST },
        { label: 'MIDWEST', label_ja: '中西部', value: MODE_MIDWEST },
        { label: 'NORTHEAST', label_ja: '北東部', value: MODE_NORTHEAST },
        { label: 'SOUTH', label_ja: '南部', value: MODE_SOUTH }
    ],

    westList = [ 'WA', 'OR', 'CA', 'MT', 'ID', 'NV', 'WY', 'UT', 'CO', 'AZ', 'NM' ],
    midwestList = [ 'ND', 'SD', 'NE', 'KS', 'MN', 'IA', 'MO', 'WI', 'IL', 'MI', 'IN', 'OH' ],
    northeastList = [ 'PA', 'NY', 'NJ', 'VT', 'NH', 'ME', 'MA', 'CT', 'RI' ],
    southList = [ 'OK', 'TX', 'AR', 'LA', 'KY', 'TN', 'MS', 'AL', 'WV', 'MD', 'DE', 'VA',
                  'NC', 'SC', 'GA', 'FL' ],

    tblUSA = {
        'AL': { 'name_ja': 'アラバマ', 'fillKey': 'D' },
        'AK': { 'name_ja': 'アラスカ', 'fillKey': 'C' },
        'AZ': { 'name_ja': 'アリゾナ', 'fillKey': 'A' },
        'AR': { 'name_ja': 'アーカンソー', 'fillKey': 'D' },
        'CA': { 'name_ja': 'カリフォルニア', 'fillKey': 'B' },
        'CO': { 'name_ja': 'コロラド', 'fillKey': 'A' },
        'CT': { 'name_ja': 'コネチカット', 'fillKey': 'C' },
        //'DC': { 'name_ja': 'ワシントン・コロンビア特別区', 'fillKey': 'C' },
        'DE': { 'name_ja': 'デラウェア', 'fillKey': 'C' },
        'FL': { 'name_ja': 'フロリダ', 'fillKey': 'B' },
        'GA': { 'name_ja': 'ジョージア', 'fillKey': 'A' },
        'HI': { 'name_ja': 'ハワイ', 'fillKey': 'A' },
        'ID': { 'name_ja': 'アイダホ', 'fillKey': 'A' },
        'IL': { 'name_ja': 'イリノイ', 'fillKey': 'B' },
        'IN': { 'name_ja': 'インディアナ', 'fillKey': 'C' },
        'IA': { 'name_ja': 'アイオワ', 'fillKey': 'D' },
        'KS': { 'name_ja': 'カンザス', 'fillKey': 'D' },
        'KY': { 'name_ja': 'ケンタッキー', 'fillKey': 'D' },
        'LA': { 'name_ja': 'ルイジアナ', 'fillKey': 'A' },
        'ME': { 'name_ja': 'メイン', 'fillKey': 'A' },
        'MD': { 'name_ja': 'メリーランド', 'fillKey': 'B' },
        'MA': { 'name_ja': 'マサチューセッツ', 'fillKey': 'A' },
        'MI': { 'name_ja': 'ミシガン', 'fillKey': 'A' },
        'MN': { 'name_ja': 'ミネソタ', 'fillKey': 'A' },
        'MS': { 'name_ja': 'ミシシッピ', 'fillKey': 'C' },
        'MO': { 'name_ja': 'ミズーリ', 'fillKey': 'A' },
        'MT': { 'name_ja': 'モンタナ', 'fillKey': 'B' },
        'NE': { 'name_ja': 'ネブラスカ', 'fillKey': 'B' },
        'NV': { 'name_ja': 'ネバダ', 'fillKey': 'D' },
        'NH': { 'name_ja': 'ニューハンプシャー', 'fillKey': 'B' },
        'NJ': { 'name_ja': 'ニュージャージー', 'fillKey': 'D' },
        'NM': { 'name_ja': 'ニューメキシコ', 'fillKey': 'D' },
        'NY': { 'name_ja': 'ニューヨーク', 'fillKey': 'B' },
        'NC': { 'name_ja': 'ノースカロライナ', 'fillKey': 'C' },
        'ND': { 'name_ja': 'ノースダコタ', 'fillKey': 'D' },
        'OH': { 'name_ja': 'オハイオ', 'fillKey': 'B' },
        'OK': { 'name_ja': 'オクラホマ', 'fillKey': 'C' },
        'OR': { 'name_ja': 'オレゴン', 'fillKey': 'C' },
        'PA': { 'name_ja': 'ペンシルベニア', 'fillKey': 'A' },
        'RI': { 'name_ja': 'ロードアイランド', 'fillKey': 'B' },
        'SC': { 'name_ja': 'サウスカロライナ', 'fillKey': 'D' },
        'SD': { 'name_ja': 'サウスダコタ', 'fillKey': 'C' },
        'TN': { 'name_ja': 'テネシー', 'fillKey': 'B' },
        'TX': { 'name_ja': 'テキサス', 'fillKey': 'B' },
        'UT': { 'name_ja': 'ユタ', 'fillKey': 'C' },
        'VT': { 'name_ja': 'バーモント', 'fillKey': 'C' },
        'VA': { 'name_ja': 'バージニア', 'fillKey': 'A' },
        'WA': { 'name_ja': 'ワシントン', 'fillKey': 'D' },
        'WV': { 'name_ja': 'ウェストバージニア', 'fillKey': 'C' },
        'WI': { 'name_ja': 'ウィスコンシン', 'fillKey': 'C' },
        'WY': { 'name_ja': 'ワイオミング', 'fillKey': 'D' }
    },

    myfills = {
        A: '#FFA0A0',
        B: '#A8FFA0',
        C: '#C2A0FF',
        D: '#FFFFA0'
    },

    smallStates = {
        RI: { x: -20, y: 60, r: 15 },
        DE: { x: -10, y: 110, r: 15 }
    },

    starPos;


STATES_KEYS = Object.keys( tblUSA );
STATES_NUM = STATES_KEYS.length;

for ( var i = 0; i < STATES_NUM; i++ ) {
    tblUSA[ STATES_KEYS[ i ] ][ 'no' ] = i;
    tblUSA[ STATES_KEYS[ i ] ][ 'id' ] = STATES_KEYS[ i ];
}


function shuffle( arr ) {
    var currentIndex = arr.length, temporaryValue, randomIndex;

    while ( 0 !== currentIndex ) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = arr[currentIndex];
        arr[currentIndex] = arr[randomIndex];
        arr[randomIndex] = temporaryValue;
    }

    return arr;
}


function addSmallStatesPlugin( map, quiz )
{
    map.addPlugin( 'smallState', function( layer ) {
        var self = this;
        var startCoodinates = this.projection( [ -67.707617, 42.722131 ] );
        geographyConfig = this.options.geographyConfig;

        this.svg.selectAll( '.datamaps-subunit' ).attr( 'data-muke', function( d ) {
            var center, state, x, y;

            if ( ! ( d.id in smallStates ) ) {
                return 'bar';
            }

            var $this = d3.select(this);

            center = self.path.centroid( d );
            state = smallStates[ d.id ];

            x = startCoodinates[0] + state.x;
            y = startCoodinates[1] + state.y;

            layer.append( 'line' )
                .attr( 'x1', x )
                .attr( 'y1', y )
                .attr( 'x2', center[0] )
                .attr( 'y2', center[1] )
                .style( 'stroke', '#000' )
                .style( 'stroke-width', 1 )

            var $circle = layer.append( 'circle' )
                .attr( 'cx', x )
                .attr( 'cy', y )
                .attr( 'r', state.r )
                .style( 'fill', myfills[ tblUSA[ d.id ].fillKey ] )
                .style( 'stroke', '#000' )
                .style( 'stroke-width', 1 )
                .on( 'mouseover', function () {
                    eventMouseOver( d.id );
                })
                .on( 'mouseout', function () {
                    eventMouseOut( d.id );
                })
                .on( 'click', function() { clickGeography( d, quiz ); } );

            statesGeos[ d.id ][ 'ex' ] = $circle;


            $this
                .on( 'mouseover', function () {
                    eventMouseOver( d.id );
                } )
                .on( 'mouseout', function () {
                    eventMouseOut( d.id );
                } );


            return "bar";
        } );
    } );

    map.smallState();
}


function addFlagStarPlugin( map, quiz )
{
    map.addPlugin( 'flagStar', function( layer ) {
        var self = this;

        var defs = layer.append( 'defs' );

        defs.append( 'rect' )
            .attr( 'id', 'flag-stripe' )
            .attr( 'width', 247 )
            .attr( 'height', 10 )
            .attr( 'fill', '#B22234' );

        defs
            .append( 'polygon' )
            .attr( 'id', 'star-pt' )
            .attr( 'points', '-0.1624598481164531,0 0,-0.5 0.1624598481164531,0' )
            .attr( 'transform', 'scale(0.0616)' )
            .attr( 'fill', '#FFF' );

        var star_g = defs.append( 'g' )
            .attr( 'id', 'flag-star' );

        star_g
            .append( 'use' )
            .attr( 'xlink:href', '#star-pt' )
            .attr( 'transform', 'rotate(-144)' );

        star_g
            .append( 'use' )
            .attr( 'xlink:href', '#star-pt' )
            .attr( 'transform', 'rotate(-72)' );

        star_g
            .append( 'use' )
            .attr( 'xlink:href', '#star-pt' );

        star_g
            .append( 'use' )
            .attr( 'xlink:href', '#star-pt' )
            .attr( 'transform', 'rotate(72)' );

        star_g
            .append( 'use' )
            .attr( 'xlink:href', '#star-pt' )
            .attr( 'transform', 'rotate(144)' );

        layer
            .append( 'rect' )
            .attr( 'x', FLAG_X )
            .attr( 'y', FLAG_Y )
            .attr( 'width', FLAG_W )
            .attr( 'height', FLAG_H )
            .style( 'stroke', '#000' )
            .style( 'fill', '#FFF' )
            .style( 'stroke-width', 1 );

        for ( var i = 0; i < 7; i++ ) {
            layer.append( 'use' )
                .attr( 'x', FLAG_X )
                .attr( 'y', FLAG_Y + (i * 20) )
                .attr( 'xlink:href', '#flag-stripe' );
        }

        layer
            .append( 'rect' )
            .attr( 'x', FLAG_X )
            .attr( 'y', FLAG_Y )
            .attr( 'width', 99 )
            .attr( 'height', 70 )
            .style( 'fill', '#3C3B6E' )
            .on( 'click', function() {
                if ( quiz.curPos < quiz.statesNum ) {
                    quiz.score.b++;
                    quiz.setScore();
                }
            } );

        this.svg.selectAll( '.datamaps-subunit' ).attr( 'data-star', function( d ) {
            var center = self.path.centroid( d );

            tblUSA[ d.id ][ 'starX' ] = center[0];
            tblUSA[ d.id ][ 'starY' ] = center[1];

            layer.append( 'use' )
                .attr( 'id', 'use-star-' + d.id )
                .attr( 'visibility', 'hidden' )
                .attr( 'xlink:href', '#flag-star' );

            return 'bar';
        } );
    } );

    map.flagStar();
}


function addBaseBallPlugin( map, quiz )
{
    map.addPlugin( 'playBall', function( layer ) {
        var i,
            self = this,
            strikeY = SCORE_Y,
            ballY = strikeY + 30,
            outY = ballY + 30,
            ballR = 10;

        layer
            .append( 'rect' )
            .attr( 'x', SCORE_X - 10 )
            .attr( 'y', SCORE_Y - 22 )
            .attr( 'width', 112 )
            .attr( 'height', 97 )
            .style( 'stroke', '#000' )
            .style( 'fill', '#FFF' )
            .style( 'stroke-width', 1 );

        layer
            .append( 'text' )
            .attr( 'x', SCORE_X )
            .attr( 'y', strikeY )
            .style( 'font-size', '16px' )
            .style( 'font-weight', 'bold' )
            .text( 'S' );

        for ( i = 0; i < 2; i++ ) {
            quiz.d3[ 'strike-' + i ] = layer
                .append( 'circle' )
                .attr( 'id', 'score-strike-' + i )
                .attr( 'cx', SCORE_X + 30 + (i*25) )
                .attr( 'cy', strikeY - (ballR / 2) )
                .attr( 'r', ballR )
                .style( 'fill', '#FFF' )
                .style( 'stroke', '#000' )
                .style( 'stroke-width', 1 )
        }

        layer
            .append( 'text' )
            .attr( 'x', SCORE_X )
            .attr( 'y', ballY )
            .style( 'font-size', '16px' )
            .style( 'font-weight', 'bold' )
            .text( 'B' );

        for ( i = 0; i < 3; i++ ) {
            quiz.d3[ 'ball-' + i ] = layer
                .append( 'circle' )
                .attr( 'id', 'score-ball-' + i )
                .attr( 'cx', SCORE_X + 30 + (i*25) )
                .attr( 'cy', ballY - (ballR / 2) )
                .attr( 'r', ballR )
                .style( 'fill', '#FFF' )
                .style( 'stroke', '#000' )
                .style( 'stroke-width', 1 )
        }

        layer
            .append( 'text' )
            .attr( 'x', SCORE_X )
            .attr( 'y', outY )
            .style( 'font-size', '16px' )
            .style( 'font-weight', 'bold' )
            .text( 'O' );

        for ( i = 0; i < 2; i++ ) {
            quiz.d3[ 'out-' + i ] = layer
                .append( 'circle' )
                .attr( 'id', 'score-out-' + i )
                .attr( 'cx', SCORE_X + 30 + (i*25) )
                .attr( 'cy', outY - (ballR / 2) )
                .attr( 'r', ballR )
                .style( 'fill', '#FFF' )
                .style( 'stroke', '#000' )
                .style( 'stroke-width', 1 )
        }
    } );

    map.playBall();
}


function eventMouseOver( stateID )
{
    var g = statesGeos[ stateID ],
        geo = d3.select( g.geo ),
        options = geographyConfig;

    if ( g.ex !== undefined ) {
        g.ex.style( 'fill', options.highlightFillColor );
    }

    var previousAttributes = {
      'fill':  geo.style( 'fill' ),
      'stroke': geo.style( 'stroke' ),
      'stroke-width': geo.style( 'stroke-width' ),
      'fill-opacity': geo.style( 'fill-opacity' )
    };

    geo
      .style( 'fill', options.highlightFillColor )
      .style( 'stroke', options.highlightBorderColor )
      .style( 'stroke-width', options.highlightBorderWidth )
      .style( 'fill-opacity', options.highlightFillOpacity )
      .attr( 'data-previousAttributes', JSON.stringify( previousAttributes ) );
}


function eventMouseOut( stateID )
{
    var g = statesGeos[ stateID ],
        geo = d3.select( g.geo );

    if ( g.ex !== undefined ) {
        g.ex.style( 'fill', myfills[ tblUSA[ stateID ].fillKey ] );
    }

    var previousAttributes = JSON.parse( geo.attr( 'data-previousAttributes' ) );
    for ( var attr in previousAttributes ) {
        geo.style( attr, previousAttributes[ attr ] );
    }
}


function createStarPos()
{
    var i, row, col, maxCol, stX;

    starPos = [];

    for ( row = 0; row < 9; row++ ) {
        if ( (row % 2) === 0 ) {
            stX = 8;
            maxCol = 6;
        } else {
            stX = 16;
            maxCol = 5;
        }

        for ( col = 0; col < maxCol; col++ ) {
            starPos.push( [ stX + Math.floor(16.5 * col), 7 * (row+1)] );
        }
    }
}

createStarPos();


function clickGeography( geo, quiz )
{
    if ( quiz.curPos >= quiz.statesNum ) {
        if ( lang == 'ja' ) {
            quiz.d3.msg.text( tblUSA[ geo.id ].name_ja );
        } else {
            quiz.d3.msg.text( tblUSA[ geo.id ].name );
        }

        return;
    }

    if ( geo.id === quiz.prevClickStateID ) {
        return;
    }

    var answerID = quiz.qIDs[ quiz.curPos ];
    var result = d3.select( '#td-result-' + answerID );

    if ( geo.id === answerID ) {
        quiz.d3.msg.text( '' );

        result.html( result.html() + '<span class="correct">O</span>' );

        var pos, x, y, oldX, oldY;

        pos = starPos[ quiz.curPos ];
        x = FLAG_X + pos[0];
        y = FLAG_Y + pos[1];

        oldX = tblUSA[ geo.id ][ 'starX' ];
        oldY = tblUSA[ geo.id ][ 'starY' ];

        d3.select( '#use-star-' + geo.id )
            .attr( 'visibility', 'visible' )
            .attr( 'transform', [ 'translate( ', oldX, ', ', oldY, ' ) scale( ', FLAG_H*3, ' )' ].join( '' ) )
            .transition()
            .duration( 2000 )
            .attr( 'transform', [ 'translate( ', x, ', ', y, ' ) scale( ', FLAG_H, ' )' ].join( '' ) );

        quiz.nextQuestion();
    } else {
        if ( lang == 'ja' ) {
            quiz.d3.msg.text( ' そこは ' + tblUSA[ geo.id ].name_ja );
        } else {
            quiz.d3.msg.text( " That't " + tblUSA[ geo.id ].name + '.' );
        }

        quiz.score.s++;
        result.html( result.html() + '<span class="mistakes">X</span>' );

        if ( quiz.score.s < MAX_MISTAKABLE ) {
            quiz.setScore();
        } else {
            quiz.score.o++;

            if ( quiz.score.o < MAX_SKIPPABLE ) {
                quiz.nextQuestion();
            } else {
                quiz.curPos = quiz.statesNum + 1;
                if ( lang == 'ja' ) {
                    quiz.d3.q.text( 'スリーアウトチェンジ！' );
                } else {
                    quiz.d3.q.text( 'The inning is over' );
                }
            }
        }
    }

    quiz.prevClickStateID = geo.id;
}


function createStatesTable( container )
{
    var table = container.append( 'table' )
        .attr( 'id', 'states-table' )
        .attr( 'class', 'states-table' );

    var statesIDs = Object.keys( tblUSA );
    var states = [];

    var i, j, data = [], chunk = 10, columns = [];

    for ( i = 0; i < chunk; i++ ) {
        columns.push( i );
    }

    for ( i = 0; i < statesIDs.length; i++ ) {
        states.push( tblUSA[ statesIDs[ i ] ] );
        states.push( { name: '', id: statesIDs[ i ] } );
    }

    for ( i = 0, j = states.length; i < j; i += chunk ) {
        data.push( states.slice( i, i+chunk ) );
    }

    var rows = table.selectAll( 'tr' )
        .data( data )
        .enter()
        .append( 'tr' );

    var cells = rows.selectAll( 'td' )
        .data( function( row, i ) {
            return columns.map( function( column ) {
                var dd = row[column],
                   name;

                if ( (column%2) === 0 ) {
                    if ( lang == 'ja' ) {
                        name = dd.name_ja;
                    } else {
                        name = dd.name;
                    }

                    return { isState: true, column: column, value: name, id: dd.id, domId: 'td-name-' + dd.id };
                } else {
                    return { isState: false, column: column, value: dd.name, id: dd.id, domId: 'td-result-' + dd.id };
                }
            } );
        } )
        .enter()
        .append( 'td' )
            .attr( 'id', function( d ) { return d.domId; } )
            .attr( 'class', function( d ) {
                if ( d.isState ) {
                    return 'td-state';
                } else {
                    return 'td-result';
                }
            } )
            .html( function( d ) {
                var href;

                if ( d.isState ) {
                    if ( lang == 'ja' ) {
                        return [ '<a href="http://ja.wikipedia.org/wiki/', d.value, '州" target="_blank">', d.value, '</a>' ].join( '' );
                    } else {
                        if ( d.value == 'Washington' ) {
                            href = 'http://en.wikipedia.org/wiki/Washington_(state)';
                        } else if ( d.value == 'Georgia' ) {
                            href = 'http://en.wikipedia.org/wiki/Georgia_(U.S._state)';
                        } else {
                            href = 'http://en.wikipedia.org/wiki/' + d.value;
                        }

                        return [ '<a href="', href, '" target="_blank">', d.value, '</a>' ].join( '' );
                    }
                } else {
                    return d.value;
                }
            } )
            .on( 'mouseover', function( d ) {
                if ( d.isState ) {
                    eventMouseOver( d.id );
                }
            } )
            .on( 'mouseout', function( d ) {
                if ( d.isState  ) {
                    eventMouseOut( d.id );
                }
            } );

    return table;
}


function USAQuiz ( container, lng )
{
    var quiz = this;

    if ( lng == 'ja' ) {
        lang = 'ja';
    } else {
        lang = 'en';
    }

    this.d3 = {};

    this.d3.container = d3.select( container );

    this.d3.panel = this.d3.container.append( 'div' )
        .attr( 'id', 'panel' )
        .attr( 'class', 'panel' );

    this.d3.region = this.d3.panel.append( 'select' )
        .attr( 'id', 'region' );

    this.d3.region
        .selectAll( 'option' )
        .data( REGIONS )
        .enter()
        .append( 'option' )
        .attr( 'value', function( d ) { return d.value; } )
        .attr( 'selected', function( d ) { if ( d.selected ) return 'selected'; } )
        .text( function( d ) {
            if ( lang == 'ja' ) {
                return d.label_ja;
            } else {
                return d.label;
            }
        } );

    this.d3.startButton = this.d3.panel.append( 'button' )
        .attr( 'id', 'start-button' )
        .attr( 'type', 'button' )
        .text( 'START' )
        .on( 'click', function () {
            var mode = parseInt( d3.select( '#region' ).node().value );

            quiz.start( mode );
        } );

    this.d3.q = this.d3.container.append( 'p' )
        .attr( 'id', 'question' )
        .attr( 'class', 'question' );

    this.d3.msgdiv = this.d3.container.append( 'p' );

    this.d3.curPos = this.d3.msgdiv.append( 'span' )
        .attr( 'id', 'cur_pos' )
        .attr( 'class', 'cur_pos' );

    this.d3.msg = this.d3.msgdiv.append( 'span' )
        .attr( 'id', 'message' )
        .attr( 'class', 'message' );

    this.d3.map = this.d3.container.append( 'div' )
        .attr( 'id', 'map' )
        .style( 'width', '1000px' )
        .style( 'height', '500px' )
        .style( 'outline', '2px solid' )
        .style( 'position', 'relative' );

    this.map = new Datamap( {
        element: this.d3.map[0][0],
        scope: 'usa',
        geographyConfig: {
            popupOnHover: false
        },
        fills: myfills,
        data: tblUSA,
        done: function( datamap ) {
            datamap.svg.selectAll( '.datamaps-subunit' ).each( function( geo ) {
                tblUSA[ geo.id ][ 'name' ] = geo.properties.name;

                statesGeos[ geo.id ]= {};
                statesGeos[ geo.id ][ 'geo' ] = this;
            } );

            datamap.svg.selectAll( '.datamaps-subunit' ).on( 'click', function( geo ) { clickGeography( geo, quiz ); } );
        }
    } );

    addSmallStatesPlugin( this.map, this );
    addFlagStarPlugin( this.map, this );
    addBaseBallPlugin( this.map, this );

    this.d3.tablediv = this.d3.container.append( 'div' );
    this.d3.table = createStatesTable( this.d3.tablediv );
}


USAQuiz.prototype.nextQuestion = function()
{
    var d;

    this.curPos++;

    if ( this.curPos > this.statesNum ) {
        return;
    }

    if ( this.curPos === this.statesNum ) {

        if ( lang == 'ja' ) {
            this.d3.q.text( '試合終了' );
        } else {
            this.d3.q.text( "The game's over." );
        }

        return;
    }

    this.score.s = 0;
    this.score.b = 0;
    this.setScore();

    d = tblUSA[ this.qIDs[ this.curPos ] ];

    this.d3.curPos.text( [ '[', this.curPos+1, '/', this.statesNum, ']  '].join( '' ) );

    if ( lang == 'ja' ) {
        this.d3.q.text( [ d.name_ja, '州 (', d.name, ') はどこ？' ].join( '' ) );
    } else {
        this.d3.q.text( [ 'Where is ', d.name, '?' ].join( '' ) );
    }
};


USAQuiz.prototype.setScore = function()
{
    var i, color;

    for ( i = 0; i < 2; i++ ) {
        if ( i < this.score.s ) {
            color = '#E9D912';
        } else {
            color = '#FFF';
        }

        this.d3[ 'strike-' + i ]
            .style( 'fill', color );
    }

    for ( i = 0; i < 3; i++ ) {
        if ( i < this.score.b ) {
            color = '#28CC8F';
        } else {
            color = '#FFF';
        }

        this.d3[ 'ball-' + i ]
            .style( 'fill', color );
    }

    for ( i = 0; i < 2; i++ ) {
        if ( i < this.score.o ) {
            color = '#E43E24';
        } else {
            color = '#FFF';
        }

        this.d3[ 'out-' + i ]
            .style( 'fill', color );
    }
};


USAQuiz.prototype.start = function( mode )
{
    if ( mode != MODE_WEST && mode != MODE_MIDWEST && mode != MODE_NORTHEAST && mode != MODE_SOUTH ) {
        mode = MODE_ALL;
    }

    this.prevClickStateID = '';
    this.d3.msg.text( '' );

    var baseList;

    if ( mode == MODE_WEST ) {
        baseList = westList;
    } else if (mode == MODE_MIDWEST ) {
        baseList = midwestList;
    } else if (mode == MODE_NORTHEAST ) {
        baseList = northeastList;
    } else if (mode == MODE_SOUTH ) {
        baseList = southList;
    } else {
        baseList = Object.keys( tblUSA );
    }

    this.qIDs = shuffle( baseList.slice(0) );
    this.statesNum = baseList.length;

    this.score = { s: 0, b: 0, o: 0 };
    this.setScore();

    this.curPos = -1;
    this.nextQuestion();

    d3.selectAll( '.td-result' ).text( '' );

    for ( var i = 0; i < STATES_NUM; i++ ) {
        d3.select( '#use-star-' + STATES_KEYS[ i ] )
            .attr( 'visibility', 'hidden' );
    }
};


function usaquiz( container, lang )
{
    return new USAQuiz( container, lang );
}


return usaquiz;
}());
