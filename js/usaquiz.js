/* global d3, window, Datamap */
(function ()
{
    "use strict";

    var
        STATES_KEYS,
        STATES_NUM,
        statesGeos = {},
        geographyConfig,
        lang = "en",

        DEF_W = 1000,
        DEF_H = 540,
        FLAG_W = 247,
        FLAG_H = 130,
        FLAG_X = DEF_W - FLAG_W,
        FLAG_Y = DEF_H - FLAG_H,

        BSO_BALL = 0,
        BSO_STRIKE = 1,
        BSO_OUT = 2,

        MAX_MISTAKABLE = 3,
        MAX_SKIPPABLE = 3,

        MODE_ALL = 0,
        MODE_WEST = 1,
        MODE_MIDWEST = 2,
        MODE_NORTHEAST = 3,
        MODE_SOUTH = 4,

        REGIONS = [
            { label: "ALL", labelJa: "全州", value: MODE_ALL, selected: true },
            { label: "WEST", labelJa: "西部", value: MODE_WEST,
                ids: [ "WA", "OR", "CA", "MT", "ID", "NV", "WY", "UT", "CO", "AZ", "NM" ] },
            { label: "MIDWEST", labelJa: "中西部", value: MODE_MIDWEST,
                ids: [ "ND", "SD", "NE", "KS", "MN", "IA", "MO", "WI", "IL", "MI", "IN", "OH" ] },
            { label: "NORTHEAST", labelJa: "北東部", value: MODE_NORTHEAST,
                ids: [ "PA", "NY", "NJ", "VT", "NH", "ME", "MA", "CT", "RI" ] },
            { label: "SOUTH", labelJa: "南部", value: MODE_SOUTH,
                ids: [ "OK", "TX", "AR", "LA", "KY", "TN", "MS", "AL", "WV", "MD", "DE", "VA",
                      "NC", "SC", "GA", "FL" ] }
        ],

        tblUSA = {
            "AL": { "name_ja": "アラバマ", "fillKey": "D" },
            "AK": { "name_ja": "アラスカ", "fillKey": "C" },
            "AZ": { "name_ja": "アリゾナ", "fillKey": "A" },
            "AR": { "name_ja": "アーカンソー", "fillKey": "D" },
            "CA": { "name_ja": "カリフォルニア", "fillKey": "B" },
            "CO": { "name_ja": "コロラド", "fillKey": "A" },
            "CT": { "name_ja": "コネチカット", "fillKey": "C" },
            //"DC": { "name_ja": "ワシントン・コロンビア特別区", "fillKey": "C" },
            "DE": { "name_ja": "デラウェア", "fillKey": "C" },
            "FL": { "name_ja": "フロリダ", "fillKey": "B" },
            "GA": { "name_ja": "ジョージア", "fillKey": "A" },
            "HI": { "name_ja": "ハワイ", "fillKey": "A" },
            "ID": { "name_ja": "アイダホ", "fillKey": "A" },
            "IL": { "name_ja": "イリノイ", "fillKey": "B" },
            "IN": { "name_ja": "インディアナ", "fillKey": "C" },
            "IA": { "name_ja": "アイオワ", "fillKey": "D" },
            "KS": { "name_ja": "カンザス", "fillKey": "D" },
            "KY": { "name_ja": "ケンタッキー", "fillKey": "D" },
            "LA": { "name_ja": "ルイジアナ", "fillKey": "A" },
            "ME": { "name_ja": "メイン", "fillKey": "A" },
            "MD": { "name_ja": "メリーランド", "fillKey": "B" },
            "MA": { "name_ja": "マサチューセッツ", "fillKey": "A" },
            "MI": { "name_ja": "ミシガン", "fillKey": "A" },
            "MN": { "name_ja": "ミネソタ", "fillKey": "A" },
            "MS": { "name_ja": "ミシシッピ", "fillKey": "C" },
            "MO": { "name_ja": "ミズーリ", "fillKey": "A" },
            "MT": { "name_ja": "モンタナ", "fillKey": "B" },
            "NE": { "name_ja": "ネブラスカ", "fillKey": "B" },
            "NV": { "name_ja": "ネバダ", "fillKey": "D" },
            "NH": { "name_ja": "ニューハンプシャー", "fillKey": "B" },
            "NJ": { "name_ja": "ニュージャージー", "fillKey": "D" },
            "NM": { "name_ja": "ニューメキシコ", "fillKey": "D" },
            "NY": { "name_ja": "ニューヨーク", "fillKey": "B" },
            "NC": { "name_ja": "ノースカロライナ", "fillKey": "C" },
            "ND": { "name_ja": "ノースダコタ", "fillKey": "D" },
            "OH": { "name_ja": "オハイオ", "fillKey": "B" },
            "OK": { "name_ja": "オクラホマ", "fillKey": "C" },
            "OR": { "name_ja": "オレゴン", "fillKey": "C" },
            "PA": { "name_ja": "ペンシルベニア", "fillKey": "A" },
            "RI": { "name_ja": "ロードアイランド", "fillKey": "B" },
            "SC": { "name_ja": "サウスカロライナ", "fillKey": "D" },
            "SD": { "name_ja": "サウスダコタ", "fillKey": "C" },
            "TN": { "name_ja": "テネシー", "fillKey": "B" },
            "TX": { "name_ja": "テキサス", "fillKey": "B" },
            "UT": { "name_ja": "ユタ", "fillKey": "C" },
            "VT": { "name_ja": "バーモント", "fillKey": "C" },
            "VA": { "name_ja": "バージニア", "fillKey": "A" },
            "WA": { "name_ja": "ワシントン", "fillKey": "D" },
            "WV": { "name_ja": "ウェストバージニア", "fillKey": "C" },
            "WI": { "name_ja": "ウィスコンシン", "fillKey": "C" },
            "WY": { "name_ja": "ワイオミング", "fillKey": "D" }
        },

        myfills = {
            A: "#FFA0A0",
            B: "#A8FFA0",
            C: "#C2A0FF",
            D: "#FFFFA0"
        },

        smallStates = {
            RI: { x: -20, y: 60, r: 15 },
            DE: { x: -10, y: 110, r: 15 }
        },

        starPos;


    function init() {
        var i, numText;

        STATES_KEYS = Object.keys( tblUSA );
        STATES_NUM = STATES_KEYS.length;

        REGIONS[MODE_ALL].ids = STATES_KEYS;

        for (i = 0; i < STATES_NUM; i++) {
            tblUSA[STATES_KEYS[i]].no = i;
            tblUSA[STATES_KEYS[i]].id = STATES_KEYS[i];
        }

        for (i = 0; i < REGIONS.length; i++) {
            numText = " (" + REGIONS[i].ids.length + ")";
            REGIONS[i].label += numText;
            REGIONS[i].labelJa += numText;
        }
    }


    function shuffle(arr) {
        var currentIndex = arr.length, temporaryValue, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = arr[currentIndex];
            arr[currentIndex] = arr[randomIndex];
            arr[randomIndex] = temporaryValue;
        }

        return arr;
    }


    function clickGeography(geo, quiz) {
        var name, text, pref, clearPrevClickID = false;

        name = quiz.getName(geo.id);

        if (quiz.curPos >= quiz.statesNum) {
            quiz.d3.msg.text(name);
            quiz.showTooltip(name);

            return;
        }

        if (geo.id === quiz.prevClickStateID) {
            return;
        }

        var answerID = quiz.qIDs[quiz.curPos];
        var result = d3.select("#td-result-" + answerID);

        if (geo.id === answerID) {
            quiz.d3.msg.text("");

            result.html(result.html() + "<span class=\"correct\">O</span>");

            var pos, x, y, oldX, oldY;

            pos = starPos[quiz.curPos];
            x = FLAG_X + pos[0];
            y = FLAG_Y + pos[1];

            oldX = tblUSA[geo.id].starX;
            oldY = tblUSA[geo.id].starY;

            d3.select("#use-star-" + geo.id)
                .attr("visibility", "visible")
                .attr("transform", ["translate( ", oldX, ", ", oldY, " ) scale( ", FLAG_H * 3, " )"].join(""))
                .transition()
                .duration(2000)
                .attr("transform", ["translate( ", x, ", ", y, " ) scale( ", FLAG_H, " )"].join(""));

            quiz.nextQuestion();

            if (quiz.curPos < quiz.statesNum) {
                if (lang === "ja") {
                    text = ["<span class=\"correct\">○</span>　", quiz.getName(), " <span class=\"usuku\">はどこ？</span>"].join("");
                    quiz.showTooltip(text);
                } else {
                    text = ["<span class=\"correct\">GOOD</span>!  <span class=\"usuku\">Where is</span> ", quiz.getName(), "<span class=\"usuku\">?</span>"].join("");
                    quiz.showTooltip(text);
                }
            } else {
                if (lang === "ja") {
                    quiz.showTooltip("<span class=\"correct\">○</span>　試合終了");
                } else {
                    quiz.showTooltip("<span class=\"correct\">Yes!</span> The game's over.");
                }
            }
        } else {
            if (lang === "ja") {
                quiz.d3.msg.text(" そこは " + name);
            } else {
                quiz.d3.msg.text(" That's " + name + ".");
            }

            quiz.bso[BSO_STRIKE]++;
            result.html(result.html() + "<span class=\"mistakes\">X</span>");

            if (lang === "ja") {
                pref = "<span class=\"mistakes\">☓</span>　" + name;
            } else {
                pref = "<span class=\"mistakes\">No</span> " + name;
            }

            if (quiz.bso[BSO_STRIKE] < MAX_MISTAKABLE) {
                quiz.setBSO();
                quiz.showTooltip(pref);
            } else {
                quiz.bso[BSO_OUT]++;

                clearPrevClickID = true;

                if (quiz.bso[BSO_OUT] < MAX_SKIPPABLE) {
                    quiz.nextQuestion();

                    if (lang === "ja") {
                        text = [pref, "　<span class=\"mistakes\">アウト</span>　", quiz.getName(), " <span class=\"usuku\">はどこ？</span>"].join("");
                        quiz.showTooltip(text);
                    } else {
                        text = [pref, " <span class=\"mistakes\">OUT</span>!  <span class=\"usuku\">Where is</span> ", quiz.getName(), "<span class=\"usuku\">?</span>"].join("");
                        quiz.showTooltip(text);
                    }
                } else {
                    quiz.curPos = quiz.statesNum + 1;

                    if (lang === "ja") {
                        quiz.d3.q.text("スリーアウトチェンジ！");
                        quiz.showTooltip(pref + "　スリーアウト チェンジ！");
                    } else {
                        quiz.d3.q.text("The inning is over");
                        quiz.showTooltip(pref + " The inning is over");
                    }
                }
            }
        }

        if (clearPrevClickID) {
            quiz.prevClickStateID = "";
        } else {
            quiz.prevClickStateID = geo.id;
        }
    }


    function eventMouseOver(stateID) {
        var g = statesGeos[stateID],
            geo = d3.select(g.geo),
            options = geographyConfig;

        if (g.ex !== undefined) {
            g.ex.style( "fill", options.highlightFillColor );
        }

        var previousAttributes = {
          "fill": geo.style("fill"),
          "stroke": geo.style("stroke"),
          "stroke-width": geo.style("stroke-width"),
          "fill-opacity": geo.style("fill-opacity")
        };

        geo
          .style("fill", options.highlightFillColor)
          .style("stroke", options.highlightBorderColor)
          .style("stroke-width", options.highlightBorderWidth)
          .style("fill-opacity", options.highlightFillOpacity)
          .attr("data-previousAttributes", JSON.stringify(previousAttributes));
    }


    function eventMouseOut(stateID) {
        var g = statesGeos[stateID],
            geo = d3.select(g.geo);

        if (g.ex !== undefined) {
            g.ex.style("fill", myfills[tblUSA[stateID].fillKey]);
        }

        var previousAttributes = JSON.parse(geo.attr("data-previousAttributes"));
        for (var attr in previousAttributes) {
            geo.style( attr, previousAttributes[attr]);
        }
    }


    function addQuestionPlugin(map, quiz) {
        map.addPlugin("addQuestionText", function(layer) {
            quiz.d3.q = layer
                .append("text")
                .attr("x", DEF_W / 2)
                .attr("y", 50)
                .style("text-anchor", "middle")
                .style("font-size", "36px")
                .style("font-weight", "bold")
                .text("");

            quiz.d3.msg = layer
                .append("text")
                .attr("x", DEF_W / 2)
                .attr("y", 80)
                .style("fill", "red")
                .style("text-anchor", "middle")
                .style("font-size", "20px")
                .style("font-weight", "bold")
                .text("");
        } );

        map.addQuestionText();
    }



    function addSmallStatesPlugin(map, quiz) {
        map.addPlugin("smallState", function(layer) {
            var self = this;
            var startCoodinates = this.projection([-67.707617, 42.722131]);
            geographyConfig = this.options.geographyConfig;

            this.svg.selectAll(".datamaps-subunit").attr("data-muke", function (d) {
                var center, state, x, y;

                if (!(d.id in smallStates)) {
                    return "bar";
                }

                var $this = d3.select(this);

                center = self.path.centroid(d);
                state = smallStates[d.id];

                x = startCoodinates[0] + state.x;
                y = startCoodinates[1] + state.y;

                layer.append("line")
                    .attr("x1", x)
                    .attr("y1", y)
                    .attr("x2", center[0])
                    .attr("y2", center[1])
                    .style("stroke", "#000")
                    .style("stroke-width", 1);

                var $circle = layer.append( "circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", state.r)
                    .style("fill", myfills[tblUSA[d.id].fillKey])
                    .style("stroke", "#000")
                    .style("stroke-width", 1)
                    .on("mouseover", function () { eventMouseOver(d.id); })
                    .on("mouseout", function () { eventMouseOut(d.id); })
                    .on("click", function() { clickGeography(d, quiz); });

                statesGeos[d.id].ex = $circle;

                $this
                    .on("mouseover", function () { eventMouseOver(d.id); })
                    .on("mouseout", function () { eventMouseOut(d.id); });

                return "bar";
            });
        });

        map.smallState();
    }


    function addFlagStarPlugin(map, quiz) {
        map.addPlugin("flagStar", function(layer) {
            var i, self = this;

            var defs = layer.append("defs");

            defs.append("rect")
                .attr("id", "flag-stripe")
                .attr("width", 247)
                .attr("height", 10)
                .attr("fill", "#B22234");

            defs
                .append("polygon")
                .attr("id", "star-pt")
                .attr("points", "-0.1624598481164531,0 0,-0.5 0.1624598481164531,0")
                .attr("transform", "scale(0.0616)")
                .attr("fill", "#FFF");

            var starG = defs.append("g")
                .attr("id", "flag-star");

            starG
                .append("use")
                .attr("xlink:href", "#star-pt")
                .attr("transform", "rotate(-144)");

            starG
                .append("use")
                .attr("xlink:href", "#star-pt")
                .attr("transform", "rotate(-72)");

            starG
                .append("use")
                .attr("xlink:href", "#star-pt");

            starG
                .append("use")
                .attr("xlink:href", "#star-pt")
                .attr("transform", "rotate(72)");

            starG
                .append("use")
                .attr("xlink:href", "#star-pt")
                .attr("transform", "rotate(144)");

            layer
                .append("rect")
                .attr("x", FLAG_X)
                .attr("y", FLAG_Y)
                .attr("width", FLAG_W)
                .attr("height", FLAG_H)
                .style("stroke", "#000")
                .style("fill", "#FFF")
                .style("stroke-width", 1);

            for (i = 0; i < 7; i++) {
                layer.append("use")
                    .attr("x", FLAG_X)
                    .attr("y", FLAG_Y + (i * 20))
                    .attr("xlink:href", "#flag-stripe");
            }

            layer
                .append("rect")
                .attr("x", FLAG_X)
                .attr("y", FLAG_Y)
                .attr("width", 99)
                .attr("height", 70)
                .style("fill", "#3C3B6E")
                .on("click", function () {
                    if (quiz.curPos < quiz.statesNum) {
                        quiz.bso[BSO_BALL]++;
                        quiz.setBSO();
                    }
                });

            this.svg.selectAll(".datamaps-subunit").attr("data-star", function (d) {
                var center = self.path.centroid(d);

                tblUSA[d.id].starX = center[0];
                tblUSA[d.id].starY = center[1];

                layer.append("use")
                    .attr("id", "use-star-" + d.id)
                    .attr("visibility", "hidden")
                    .attr("xlink:href", "#flag-star");

                return "bar";
            });
        });

        map.flagStar();
    }


    function addBaseBallPlugin(map, quiz) {
        map.addPlugin("playBall", function (layer) {
            var i,
                BSO_X = DEF_W - 140,
                BSO_Y = 200,
                ballY = BSO_Y + 22,
                strikeY = ballY + 30,
                outY = strikeY + 30,
                ballR = 10;

            quiz.$bso = [[0, 0, 0], [0, 0], [0, 0]];

            layer
                .append("rect")
                .attr("x", BSO_X)
                .attr("y", BSO_Y)
                .attr("width", 112)
                .attr("height", 97)
                .style("stroke", "#000")
                .style("fill", "#333")
                .style("stroke-width", 1);

            layer
                .append("text")
                .attr("class", "bso-text")
                .attr("x", BSO_X + 10)
                .attr("y", ballY)
                .text("B");

            for (i = 0; i < 3; i++) {
                quiz.$bso[BSO_BALL][i] = layer
                    .append("circle")
                    .attr("id", "bso-ball-" + i)
                    .attr("class", "bso-off")
                    .attr("cx", BSO_X + 40 + (i * 25))
                    .attr("cy", ballY - (ballR / 2))
                    .attr("r", ballR);
            }

            layer
                .append("text")
                .attr("class", "bso-text")
                .attr("x", BSO_X + 10)
                .attr("y", strikeY)
                .text("S");

            for (i = 0; i < 2; i++) {
                quiz.$bso[BSO_STRIKE][i] = layer
                    .append( "circle")
                    .attr("id", "bso-strike-" + i)
                    .attr("class", "bso-off")
                    .attr("cx", BSO_X + 40 + (i * 25))
                    .attr("cy", strikeY - (ballR / 2))
                    .attr("r", ballR);
            }

            layer
                .append("text")
                .attr("class", "bso-text")
                .attr("x", BSO_X + 10)
                .attr("y", outY)
                .text("O");

            for (i = 0; i < 2; i++) {
                quiz.$bso[BSO_OUT][i] = layer
                    .append( "circle")
                    .attr("id", "bso-out-" + i)
                    .attr("class", "bso-off")
                    .attr("cx", BSO_X + 40 + (i * 25))
                    .attr("cy", outY - (ballR / 2))
                    .attr("r", ballR );
            }
        } );

        map.playBall();
    }


    function createStarPos() {
        var row, col, maxCol, stX;

        starPos = [];

        for (row = 0; row < 9; row++) {
            if ((row % 2) === 0) {
                stX = 8;
                maxCol = 6;
            } else {
                stX = 16;
                maxCol = 5;
            }

            for (col = 0; col < maxCol; col++) {
                starPos.push([stX + Math.floor(16.5 * col), 7 * (row + 1)]);
            }
        }
    }

    createStarPos();


    function createStatesTable(container) {
        var table = container.append("table")
            .attr("id", "states-table")
            .attr("class", "states-table");

        var statesIDs = Object.keys(tblUSA);
        var states = [];

        var i, j, data = [], chunk = 10, columns = [];

        for (i = 0; i < chunk; i++) {
            columns.push( i );
        }

        for (i = 0; i < statesIDs.length; i++) {
            states.push(tblUSA[statesIDs[i]]);
            states.push({ name: "", id: statesIDs[i] });
        }

        for (i = 0, j = states.length; i < j; i += chunk) {
            data.push(states.slice(i, i + chunk));
        }

        var rows = table.selectAll("tr")
            .data(data)
            .enter()
            .append("tr");

        rows.selectAll("td")
            .data(function(row) {
                return columns.map(function (column) {
                    var dd = row[column],
                       name;

                    if ((column % 2) === 0) {
                        if (lang === "ja") {
                            name = dd.name_ja;
                        } else {
                            name = dd.name;
                        }

                        return { isState: true, column: column, value: name, id: dd.id, domId: "td-name-" + dd.id };
                    } else {
                        return { isState: false, column: column, value: dd.name, id: dd.id, domId: "td-result-" + dd.id };
                    }
                });
            })
            .enter()
            .append("td")
                .attr("id", function (d) { return d.domId; })
                .attr("class", function (d) {
                    if (d.isState) {
                        return "td-state";
                    } else {
                        return "td-result";
                    }
                })
                .html( function (d) {
                    var href;

                    if (d.isState) {
                        if (lang === "ja") {
                            return ["<a href=\"http://ja.wikipedia.org/wiki/", d.value, "州\" target=\"_blank\">", d.value, "</a>"].join("");
                        } else {
                            if (d.value === "Washington") {
                                href = "http://en.wikipedia.org/wiki/Washington_(state)";
                            } else if (d.value === "Georgia") {
                                href = "http://en.wikipedia.org/wiki/Georgia_(U.S._state)";
                            } else {
                                href = "http://en.wikipedia.org/wiki/" + d.value;
                            }

                            return ["<a href=\"", href, "\" target=\"_blank\">", d.value, "</a>"].join("");
                        }
                    } else {
                        return d.value;
                    }
                })
                .on("mouseover", function (d) {
                    if (d.isState) {
                        eventMouseOver(d.id);
                    }
                })
                .on("mouseout", function (d) {
                    if (d.isState) {
                        eventMouseOut(d.id);
                    }
                });

        return table;
    }


    function USAQuiz(container, lng) {
        var quiz = this;

        if (lng === "ja") {
            lang = "ja";
        } else {
            lang = "en";
        }

        this.d3 = {};

        this.d3.container = d3.select(container);

        this.d3.panel = this.d3.container.append("div")
            .attr("id", "panel")
            .attr("class", "panel");

        this.d3.region = this.d3.panel.append("select")
            .attr("id", "region")
            .on("change", function () {
                var mode = MODE_ALL;

                try {
                    mode = parseInt(d3.select("#region").node().value);
                } catch (e) {
                }

                quiz.start(mode);
            });

        this.d3.region
            .selectAll("option")
            .data(REGIONS)
            .enter()
            .append("option")
            .attr("value", function (d, i) { return i; })
            .attr("selected", function (d) { if (d.selected) { return "selected"; } })
            .text(function (d) {
                if (lang === "ja") {
                    return d.labelJa;
                } else {
                    return d.label;
                }
            });

        this.d3.curPos = this.d3.panel.append("span")
            .attr("id", "cur_pos")
            .attr("class", "cur_pos");

        this.d3.map = this.d3.container.append("div")
            .attr("id", "map")
            .style("width", DEF_W + "px")
            .style("height", DEF_H + "px")
            .style("outline", "2px solid")
            .style("position", "relative");

        this.map = new Datamap({
            element: this.d3.map[0][0],
            scope: "usa",
            geographyConfig: {
                borderColor: "#000",
                popupOnHover: false
            },
            fills: myfills,
            data: tblUSA,
            done: function (datamap) {
                datamap.svg.selectAll(".datamaps-subunit").each(function (geo) {
                    tblUSA[geo.id].name = geo.properties.name;

                    statesGeos[geo.id] = {};
                    statesGeos[geo.id].geo = this;
                });

                datamap.svg.selectAll(".datamaps-subunit").on("click", function (geo) { clickGeography(geo, quiz); });
            }
        });

        this.d3.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        addQuestionPlugin( this.map, this );
        addSmallStatesPlugin( this.map, this );
        addFlagStarPlugin( this.map, this );
        addBaseBallPlugin( this.map, this );

        this.d3.tablediv = this.d3.container.append("div");
        this.d3.table = createStatesTable(this.d3.tablediv);
    }


    USAQuiz.prototype.nextQuestion = function() {
        var d;

        this.curPos++;

        if (this.curPos > this.statesNum) {
            return;
        }

        if (this.curPos === this.statesNum) {

            if (lang === "ja") {
                this.d3.q.text("試合終了");
            } else {
                this.d3.q.text("The game's over.");
            }

            return;
        }

        this.bso[BSO_STRIKE] = 0;
        this.bso[BSO_BALL] = 0;
        this.setBSO();

        d = tblUSA[this.qIDs[this.curPos]];

        this.d3.curPos.text(["[", this.curPos + 1, "/", this.statesNum, "]  "].join(""));

        if (lang === "ja") {
            this.d3.q.text([d.name_ja, "州 (", d.name, ") はどこ？"].join(""));
        } else {
            this.d3.q.text(["Where is ", d.name, "?"].join(""));
        }
    };


    USAQuiz.prototype.setBSO = function() {
        var i, k;

        for (i = 0; i < this.$bso.length; i++) {
            for (k = 0; k < this.$bso[i].length; k++) {
                if (k < this.bso[i]) {
                    this.$bso[i][k].attr("class", "bso-on-" + i);
                } else {
                    this.$bso[i][k].attr("class", "bso-off");
                }
            }
        }
    };


    USAQuiz.prototype.getName = function (id) {
        var name;

        if (!id) {
            id = this.qIDs[this.curPos];

            if (!id) {
                return "";
            }
        }

        if (lang === "ja") {
            name = tblUSA[id].name_ja;
        } else {
            name = tblUSA[id].name;
        }

        return name;
    };


    USAQuiz.prototype.showTooltip = function (text) {
        var quiz = this;

        this.d3.tooltip.transition()
            .duration(200)
            .style("opacity", .9);

        this.d3.tooltip.html(text)
            .style("left", (d3.event.pageX + 14) + "px")
            .style("top", (d3.event.pageY - 14) + "px");

        if (this.ttTimerID) {
            window.clearTimeout(this.ttTimerID);
        }

        this.ttTimerID = window.setTimeout(function () {
            quiz.d3.tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            this.ttTimerID = null;
        }, 3000);
    };


    USAQuiz.prototype.start = function(mode) {
        var i;

        if (mode === undefined || mode < 0 || mode >= REGIONS.length) {
            mode = MODE_ALL;
        }

        this.prevClickStateID = "";
        this.d3.msg.text("");

        this.qIDs = shuffle(REGIONS[mode].ids.slice(0));
        this.statesNum = this.qIDs.length;

        this.bso = [0, 0, 0];
        this.setBSO();

        this.curPos = -1;
        this.nextQuestion();

        d3.selectAll(".td-result").text("");

        for (i = 0; i < STATES_NUM; i++) {
            d3.select("#use-star-" + STATES_KEYS[i])
                .attr("visibility", "hidden");
        }
    };


    function usaquiz(container, lng) {
        return new USAQuiz(container, lng);
    }

    init();

    window.usaquiz = usaquiz;
}());
