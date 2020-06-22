import { PET_COUNT } from './config.js';

ig.ENTITY.Player.prototype.skin.pets = [];
ig.ENTITY.Player.inject({
	update(...args) {
		// already did pet action, choose new one
		if (!this.skin.pet) {
			let petsInRange = this.getCloseRangePets();
			if (petsInRange) {
				this.skin.pet = petsInRange.random();
			}
		}
		this.parent(...args);
		// timer was reset, pick new pet
		if (this.idle.timer >= 5) {
			this.skin.pet = null;
		}
	},

	updateSkinPet(showEffects) {
		if(this.skin.pets.length){
			this.skin.pets.forEach((pet) => pet.remove());
		}
		const petSkin = sc.playerSkins.getCurrentSkin("Pet");
		if(petSkin && petSkin.loaded) {
			this.skin.pets = Array.from({ length: PET_COUNT }, (_value, index) => {
				return ig.game.spawnEntity(sc.PlayerPetEntity, 0, 0, 0, {
					petSkin,
					petId: index
				}, showEffects || false);
			});
		}
	},

	getCloseRangePets() {
		const petArr = this.skin.pets.filter((pet) => {
			return ig.CollTools.getGroundDistance(pet.coll, this.coll) < 32 &&
							Vec2.dot(pet.face, this.face) <= 0 &&
							pet.coll.pos.z === this.coll.pos.z
		});
		return petArr.length ? petArr : null;
	},

	onPlayerPlaced(...args) {
		this.parent(...args);
		this.skin.pets.forEach((pet) => pet.resetStartPos());
	}
});

sc.PlayerPetEntity.inject({
	petId: 0,

	init(x, y, z, settings, ...args) {
		this.petId = settings.petId + 1;
		this.parent(x, y, z, settings, ...args);
		const xDist = 40, yDist = 30;
		let angle = this.getAngle();
		this.posOffset = Vec2.createC(
			Math.floor(xDist * Math.cos(angle)),
			Math.floor(-yDist * Math.sin(angle)),
		);
	},

	resetStartPos() {
		this.parent();
		let angle = this.getAngle();
		this.coll.setPos(
			this.coll.pos.x + PET_COUNT * Math.sin(angle),
			this.coll.pos.y + PET_COUNT * Math.cos(angle),
			this.coll.pos.z
		);
	},

	getAngle() {
		return (this.petId * Math.PI * (180/(PET_COUNT + 1))) / 180;
	}
});
