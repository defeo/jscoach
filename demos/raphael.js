function Player(paper, number, x, y, options) {
    this._opt = options;
    this._gr = paper.set().push(
	paper.circle(x, y, 10),
	paper.text(x, y, number)
    );

    this.move = function(x, y, cb) {
	var dx = (this._gr[0].attr('x') - x);
	var dy = (this._gr[0].attr('y') - y);
	var time = Math.sqrt(dx*dx + dy*dy) / this._opt.speed;
	this._gr.animate({'cx' : x, 'cy': y, 
			  'x': x, 'y': y}, 
			 time, cb);
    };
}


function play(play) {
    var opt = {
	speed: 0.3,
	element: 'play',
    }
    for (var o in play.config) opt[o] = play.config[o];

    var paper = Raphael(opt.element, 400, 400);
    paper.rect(0, 0, 400, 400).attr({'fill': '#eee'});
    var players = {};

    var steps = [];
    for (var s = 0; s < play.steps.length; s++) {
	steps.push((function(step) {
	    return function (next) {
		var actions = [];

		for (var a = 0; a < step.length; a++) {
		    actions.push((function(act) {
			return function(next) {
			    if (act.action === undefined) {
				console.log('Placing ' + act.id + ' in ' + act.x + ', ' + act.y);
				players[act.id] = new Player(paper, act.id, act.x, act.y, opt);
				next();
			    } else {
				console.log(act.action + 'ing ' + act.id);
				var p = players[act.id];
				act.args.push(next);
				p[act.action].apply(p, act.args);
			    }
			}
		    })(step[a]));
		}

		var counter = step.length;
		var done = function() {
		    counter--;
		    if (counter == 0) {
			next();
		    }
		}
		for (var a = 0; a < actions.length; a++)
		    actions[a](done);
	    }
	})(play.steps[s]));
    }

    var s = 0;
    var next = function() {
	if (s < steps.length) {
	    steps[s++](next);
	}
    };
    next();
}
