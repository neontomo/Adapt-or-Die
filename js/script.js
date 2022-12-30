/* CONFIG */

windowWidth = $(window).width();
windowHeight = $(window).height();
mainWidth = $('main').outerWidth();
mainHeight = $('main').outerHeight();
gameRunning = true;
maxDots = 100;
timer = 10;
activeTimer = timer;
namesEnabled = true;

var mutationsList = [
	{
		name: 'god',
		speed: 1,
		mutationRate: 0.3,
		alive: true,
		innerColor: randomColor(),
		borderColor: randomColor(),
		outlineColor: randomColor(),
		borderRadius: randomBorderRadius(),
		directions: '0123'
	}
];

function findMutation(name) {
	return mutationsList.find(mutationsList => mutationsList.name === name);
}

/* RANDOM */

function randomNumber(type, min, max, not) {
	var r = (type == 'int') ? Math.floor(Math.random() * (max - min + 1)) + min : (Math.random() * (max - min) + min).toFixed(1);
	if (!not) {
		return r;
	} else {
		return not == r ? randomNumber(type, min, max, not) : r;
	}
}

function probability(decimal) {
	return !!decimal && Math.random() <= decimal;
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
	for (var i = 0; i < mutationsList.length; i++) {
		if (mutationsList[i].alive == true) {
			$('.dot[name="' + mutationsList[i].name + '"]').each(function () {
				var directions = mutationsList[i].directions;
				var direction = directions[randomNumber('int', 0, directions.length - 1)];
				moveDot($(this), direction, mutationsList[i].speed);
			});
		}
	}
}

/* KILL & REWARD */

function killDots() {
	$('.dot').each(function () {		
		var dotName = $(this).attr('name');
		
		if ($('#collider').collision($('.dot[name="' + dotName + '"]')).length == 0) { // extinct
			for (var i = 0; i < mutationsList.length; i++) {
				if (mutationsList[i].name == dotName) {
					mutationsList[i].alive = false;
				}
			}
		}
		if ($('#collider').collision(this).length == 0) { // dead
			$(this).remove();
		}
	});
}

function rewardDots() {
	$('.dot').css({ left: mainWidth / 2, top: mainHeight / 2 });
	
	for (var i = 0; i < mutationsList.length; i++) {
		if (mutationsList[i].alive == true) {
			$('.dot[name="' + mutationsList[i].name + '"]').each(function () {
				var dotName = $(this).attr('name');
				var mutationRate = mutationsList[i].mutationRate;
				if (randomNumber('dec', mutationRate, 1) == mutationRate) {
					// Chance of mutation
					mutate(mutationsList[i]);
				} else {
					// Chance of carbon copy
					spawnDot(mutationsList[i]);
				}
			});
		}
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

function spawn(mutation) {
	if ($('.dot').length >= maxDots) return;
	
	var dot = $('<div></div>')
	.attr('class', 'dot')
	.attr('name', mutation.name)
	.css({
		left: mainWidth / 2,
		top: mainHeight / 2,
		background: mutation.innerColor,
		border: randomNumber('int', 1, 6) + 'px solid ' + mutation.borderColor,
		outline: randomNumber('int', 1, 5) + 'px solid ' + mutation.outlineColor,
		borderRadius: mutation.borderRadius
	}).appendTo('main');
	
	if (namesEnabled == true) {
		dot.attr('seeNames', 'true');
	}
}

function changeDecimalUpOrDown(value, max) {
	if (probability(0.6)) {
		var newValue = (probability(0.5)) ? ((value * 10) + 1) / 10 : ((value * 10) - 1) / 10;
		newValue = (newValue <= 0.1) ? 0.1 : newValue;
		newValue = (newValue >= max) ? max : newValue;
		return newValue;
	} else {
		return value;
	}
}

function mutate(previous) {
	var newName = cuteName(6);
	var speed = previous.speed;
	var newSpeed = (randomNumber('int', 0, 1) == 0) ? ((speed * 10) - 1) / 10 : ((speed * 10) + 1) / 10;
	newSpeed = (newSpeed <= 0.1) ? 0.1 : newSpeed;
	newSpeed = (newSpeed >= 5) ? 5 : newSpeed;

	var newMutation = { /* TODO: all the values below */
		name: cuteName(6),
		speed: newSpeed,
		mutationRate: 0.3,
		alive: true,
		innerColor: randomColor(),
		borderColor: randomColor(),
		outlineColor: randomColor(),
		borderRadius: randomBorderRadius(),
		directions: previous.directions + getRandomDirections()
	}
	mutationsList.push(newMutation);
	spawnDot(newMutation);
	
	//console.log('Mutating from ' + previous.name + ' to ' + newMutation.name);
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
