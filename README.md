# Adapt or Die

<img width="954" alt="Untitled" src="https://user-images.githubusercontent.com/105588693/210104580-b440a432-175d-4ade-bffe-fbc08ba4b6cb.png">

In Adapt or Die, we build a game where AI organisms fight to survive against the harsh realities of nature.

## Play it

A playable version is available [here](https://neontomo.com/play/adapt-or-die).

I made a [YouTube video](https://www.youtube.com/watch?v=NZtqoAKIKg8) describing my entire thought process, which may help you to build your own version.

## What this is good for

This is my first foray into coding characters that mutate and change over time, based on attributes, inheritance and random value generation. I think it's quite interesting as a way of visualizing how evolution works (although on a much bigger scale, and more complicated). Still, I think one of the best ways of understanding a concept is by trying to build it, work with it and see how it starts to make sense in your mind.

## How to play

When you start the game, 100 randomly mutated creatures are spawned, I call them "dots". They will move in random directions and will have a bias towards certain directions, causing some creatures to survive until the next generation if they are standing in the green zone when the timer ends. Those creatures who survive will give birth to new creatures that are either exact copies of their parent, or that will have some slightly variations/mutations such as a different speed, direction tendency and size. All the dots that don't make it to the green zone are killed, which leads to an evolutionary system where only the strong survive. You can move and resize the green zone with your mouse (not on mobile).

## The technology involved and what I learned

When I first built the game, I struggled to generate enough dots on the screen and animating them to make it interesting. This was because I was using jQuery to manipulate the DOM and set the fixed positions left (X axis) and top (Y axis) of the elements moving, which is not too efficient. I ended up changing this by creating a function that takes in these parameters:

`moveObject(element, x, y, speed)`

This function uses the CSS transform option to change where the elements are displayed rather than where they are positioned.

I also struggled to create a data storage system for holding mutations in a way that would be clear for me as the human programming it, and making it resistant to changes in my code if I add more features. It's easy to hack something together with trial and error, but hard to make it reliable because it requires you to actually understand it. What I settled on was an array of dictionary values:
```
let mutationsList = [
	{
		name: 'god',
		speed: 0.07, // seconds it takes to move one step. low is fast
		mutationRate: 0.5,
		directions: '0123'
	}
];
```
This is the initial seed that spawns the other mutations, which are appended to the array upon spawning. Every animation and interaction takes their data straight from this storage. This made my code clean and easy to understand, as each mutation change was simply an attribute to be called, which I did with this function that finds the mutation by its' name:
```
function findMutation(name) {
	return (mutationsList.find(mutationsList => mutationsList.name === name)) ? mutationsList.find(mutationsList => mutationsList.name === name) : false;
}
```
I'm sure there are more lessons to be learned and several inefficiencies, but these are my current learnings!

## Use my work

Feel free to modify my code however you wish, but credit me in the source code! ;)
