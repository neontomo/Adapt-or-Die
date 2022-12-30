/* CONFIG */

/* TODO: add max amount of same mutation */

mainWidth = $('main').outerWidth();
mainHeight = $('main').outerHeight();
gameRunning = true;
maxDots = 100;
timer = 10;
activeTimer = timer;
namesEnabled = true;

let mutationsList = [
	{
		name: 'god',
		speed: 1,
		mutationRate: 0.5,
		alive: false,
		innerColor: randomColor(),
		borderColor: randomColor(),
		borderPx: randomNumber('int', 1, 6),
		outlineColor: randomColor(),
		outlinePx: randomNumber('int', 1, 6),
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

function randomBorderRadius() {
	return [
		randomNumber('int', 0, 30),
		randomNumber('int', 0, 30),
		randomNumber('int', 0, 30),
		randomNumber('int', 0, 30)
	].join('px ') + 'px';
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

function getRandomDirections() {
	return [
		randomNumber('int', 0, 3),
		randomNumber('int', 0, 3),
		randomNumber('int', 0, 3),
		randomNumber('int', 0, 3)
	].join('');
}

/* MOVING THE AI AROUND */

function checkBounds(left, top) {
	top = (top < 0) ? 0 : top; // top
	top = (top > mainHeight) ? mainHeight : top; // bottom
	left = (left < 0) ? 0 : left; // left
	left = (left > mainWidth) ? mainWidth : left; // right
	return [left, top];
}

function moveDot(dot, direction, speed) {
	var direction = Number(direction);
	var position = dot.offset();
	var left = position.left;
	var top = position.top;
	
	if (direction == 0) {
		var top = position.top - speed;
	} else if (direction == 1) {
		var left = position.left + speed;
	} if (direction == 2) {
		var top = position.top + speed;
	} if (direction == 3) {
		var left = position.left - speed;
	}
	var positions = checkBounds(left, top);
	dot.css({ left: positions[0], top: positions[1] });
}

function animateDots() {
	if (gameRunning == false) return;
	
	$('.dot').each(function () {
		var currentMutation = findMutation($(this).attr('name'));
		if (currentMutation.alive == true) {
			var directions = currentMutation.directions;
			var direction = directions[randomNumber('int', 0, directions.length - 1)];
			moveDot($(this), direction, currentMutation.speed);
		}
	});
}

/* KILL & REWARD */

function killDots() {
	$('.dot').each(function () {
		var dotName = $(this).attr('name');
		
		if ($('#collider').collision($('.dot[name="' + dotName + '"]')).length == 0) { // extinct
			findMutation(dotName).alive = false;
		}
		if ($('#collider').collision(this).length == 0) { // dead
			$(this).remove();
		}
	});
}

function rewardDots() {
	$('.dot').css({ left: mainWidth / 2, top: mainHeight / 2 });
	
	$('.dot').each(function () {
		var currentMutation = findMutation($(this).attr('name'));
		if (probability(currentMutation.mutationRate)) {
			mutate(currentMutation);
		} else {
			spawn(currentMutation);
		}
	});
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
	
	mutation.alive = true;
	
	var dot = $('<div></div>')
	.attr('class', 'dot')
	.attr('name', mutation.name)
	.css({
		left: mainWidth / 2,
		top: mainHeight / 2,
		background: mutation.innerColor,
		border: mutation.borderPx + 'px solid ' + mutation.borderColor,
		outline: mutation.outlinePx + 'px solid ' + mutation.outlineColor,
		borderRadius: mutation.borderRadius
	}).appendTo('main').on('mouseover', function () {
		updateInfo(this);
	});
	
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
	
	mutationsList.push({
		name: newName,
		speed: changeDecimalUpOrDown(previous.speed, 5),
		mutationRate: changeDecimalUpOrDown(previous.mutationRate, 1),
		innerColor: randomColor(),
		borderColor: randomColor(),
		borderPx: randomNumber('int', 0, 6),
		outlineColor: randomColor(),
		outlinePx: randomNumber('int', 0, 6),
		borderRadius: randomBorderRadius(),
		directions: previous.directions + getRandomDirections()
	});
	
	spawn(findMutation(newName));
}

/* INTERVALS & TIMEOUTS */

setInterval(function () {
	animateDots();
}, 1);

setInterval(function () {
	updateTimer();
}, 1000);

/* OTHER */

$('#timer').html((activeTimer).toString().padStart(2, '0'));
$('#collider').resizable({ handles: 'se' }).draggable({ containment: $('main') });

for (var i = 0; i < 100; i++) {
	mutate(mutationsList[0]);
}

function updateInfo(element) {
	var dotName = $(element).attr('name');
	var currentMutation = findMutation(dotName);
	$('#info').show();
	$('#info #dotName').html('<b>Name:</b> ' + dotName);
	$('#info #dotSpeed').html('<b>Speed:</b> ' + currentMutation.speed);
	$('#info #dotMutationRate').html('<b>Mutation rate:</b> ' + currentMutation.mutationRate);
}

$('#info').on('click', function () {
	$(this).hide();
});