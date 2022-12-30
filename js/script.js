/* CONFIG */

windowWidth = $(window).width();
windowHeight = $(window).height();
mainLeft = $('main').offset().left;
mainTop = $('main').offset().top;
mainWidth = $('main').outerWidth();
mainHeight = $('main').outerHeight();
gameRunning = true;
maxDots = 100;
timer = 10;
activeTimer = timer;
namesEnabled = true;

mutations = [
	{
		name: 'god', /* Initial seed. I'm not religious I swear */
		S: 2,
		D: 0.1,
		R: 0.2,
		Dir: '0123',
		background: randomColor(),
		border: randomNumber('int', 0, 6) + 'px solid ' + randomColor(),
		outline: randomNumber('int', 0, 5) + 'px solid ' + randomColor(),
		borderRadius: [randomNumber('int', 0, 30), randomNumber('int', 0, 30), randomNumber('int', 0, 30), randomNumber('int', 0, 30)].join('px ') + 'px'
	}
];

/* RANDOM */

function randomNumber(type, min, max, not) {
	var r = (type == 'int') ? Math.floor(Math.random() * (max - min + 1)) + min : (Math.random() * (max - min) + min).toFixed(1);
	if (!not) {
		return r;
	} else {
		return not == r ? randomNumber(type, min, max, not) : r;
	}
}

function randomColor() {
	var h = randomNumber('int', 0, 360);
	var s = randomNumber('int', 42, 98);
	var l = randomNumber('int', 40, 90);
	return `hsl(${h},${s}%,${l}%)`;
}

function cuteName(length) {
	var cuteName = [];
	var c = 'bcdfghjklmnpqrstvwxyz'.split('');
	var v = 'aeiou'.split('');
	
	for (var i = 0; i < (length / 2); i++) {
		cuteName.push(c[randomNumber('int', 0, c.length - 1)], v[randomNumber('int', 0, v.length - 1)]);
	}
	return cuteName.join('');
}

/* MOVING THE AI AROUND */

function checkBounds(left, top) {
	top = (top < mainTop + 5) ? mainTop + 5 : top; // top
	top = (top > mainTop + mainHeight - 20) ? mainTop + mainHeight - 20 : top; // bottom
	left = (left < mainLeft + 5) ? mainLeft + 5 : left; // left
	left = (left > mainWidth - 20) ? mainWidth - 20 : left; // right
	return [left, top];
}

function moveDot(dot, direction) {
	direction = Number(direction);
	var S = Number(dot.attr('S')) / 3;
	var position = dot.offset();
	var left = position.left;
	var top = position.top;
	
	if (direction == 0) {
		var top = position.top - S;
	} else if (direction == 1) {
		var left = position.left + S;
	} if (direction == 2) {
		var top = position.top + S;
	} if (direction == 3) {
		var left = position.left - S;
	}
	var positions = checkBounds(left, top);
	dot.css({ left: positions[0], top: positions[1] });
}

function animateDots() {
	if (gameRunning == false) return;
	
	$('.dot').each(function () {
		var direction = $(this).attr('Dir').split('');
		direction = direction[randomNumber('int', 0, direction.length - 1)];
		moveDot($(this), direction);
	});
}

/* KILL & REWARD */

function killDots() {
	$('.dot').each(function () {		
		if ($('#collider').collision(this).length == 0) {
			$(this).remove();
		}
	});
}

function rewardDots() {
	for (var i = 0; i < mutations.length; i++) {
		$('.dot[name="' + mutations[i].name + '"]').each(function () {
			var positions = [mainLeft + (mainWidth / 2), mainTop + (mainHeight / 2)];
			$(this).css({ left: positions[0], top: positions[1] });
			
			if (randomNumber('int', 1, 3) == 1) {
				// 1 in 3 chance of mutation
				mutate(mutations[i]);
			} else {
				// 2 in 3 chance of carbon copy
				spawnDot(mutations[i]);
			}
		});
	}
}

function updateTimer() {
	activeTimer--;
	$('#timer').html((activeTimer).toString().padStart(2, '0'));
	if (activeTimer == 0) {
		gameRunning = false;
		activeTimer = timer + 1;
		killDots();
		setTimeout(function() {
			rewardDots();
		}, 1000)
	} else {
		gameRunning = true;
	}
}

/* SPAWNING & MUTATING */

function spawnDot(mutation) {
	if ($('.dot').length >= maxDots) return;
	
	var positions = [mainLeft + (mainWidth / 2), mainTop + (mainHeight / 2)];
	
	var dot = $('<div></div>')
	.attr('class', 'dot')
	.attr('name', mutation.name)
	.attr('D', mutation.D)
	.attr('R', mutation.R)
	.attr('S', mutation.S)
	.attr('B', mutation.B)
	.attr('Dir', mutation.Dir)
	.css({ left: positions[0], top: positions[1], background: mutation.background, border: mutation.border, outline: mutation.outline, borderRadius: mutation.borderRadius })
	.appendTo('main');
	
	if (namesEnabled == true) {
		dot.attr('seeNames', 'true');
	}
}

function mutate(previous) {
	var newName = cuteName(6);
	
	var D = [(((previous.D * 10) - 1) / 10), (((previous.D * 10) + 1) / 10)][randomNumber('int', 0, 1)];
	D = (D < 0.1) ? 0 : D;
	D = (D > 1) ? 1 : D;
	
	var R = [(((previous.R * 10) - 1) / 10), (((previous.R * 10) + 1) / 10)][randomNumber('int', 0, 1)];
	R = (R < 0.1) ? 0 : R;
	R = (R > 1) ? 1 : R;
	
	var S = [previous.S - 1, previous.S + 1][randomNumber('int', 0, 1)];
	S = (S < 1) ? 1 : S;
	S = (S > 100) ? 100 : S;
	
	var newMutation = {
		name: newName,
		S: S,
		D: D,
		R: R,
		Dir: previous.Dir + [randomNumber('int', 0, 3), randomNumber('int', 0, 3), randomNumber('int', 0, 3), randomNumber('int', 0, 3)].join(''),
		border: randomNumber('int', 0, 6) + 'px solid ' + randomColor(),
		outline: randomNumber('int', 0, 6) + 'px solid ' + randomColor(),
		background: randomColor(),
		borderRadius: [randomNumber('int', 0, 30), randomNumber('int', 0, 30), randomNumber('int', 0, 30), randomNumber('int', 0, 30)].join('px ') + 'px'
	}
	mutations.push(newMutation);
	spawnDot(newMutation);
	
	console.log('Mutating from ' + previous.name + ' to ' + newMutation.name);
}

/* INTERVALS & TIMEOUTS */

setInterval(function () {
	animateDots();
}, 1 / 10);

setInterval(function () {
	updateTimer();
}, 1000);

/* OTHER */

$('#timer').html((activeTimer).toString().padStart(2, '0'));
$('#collider').resizable({ handles: 'se' }).draggable({ containment: $('main') });

for (var i = 0; i < 100; i++) {
	mutate(mutations[0]);
}