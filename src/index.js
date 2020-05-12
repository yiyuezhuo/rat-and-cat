import Phaser from "phaser";
//import rexvirtualjoystickplugin from 'rexvirtualjoystickplugin.min.js';

//import logoImg from "./assets/logo.png";
import catImg from "./assets/cat.png";
import cat2Img from "./assets/cat2.png"
import ratImg from "./assets/rat.png"
import huntImg from "./assets/cat_catch_rat.png"
import cheeseImg from "./assets/cheese.png"

import rexvirtualjoystickplugin from "./assets/rexvirtualjoystickplugin.min.jsr"


const MainScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:
  function SceneA ()
  {
      Phaser.Scene.call(this, { key: 'mainScene' });
  },

  preload: function() {
    //this.load.image("logo", logoImg);
    this.load.image("rat", ratImg);
    this.load.image("cat", catImg);
    this.load.image("cat2", cat2Img);
    this.load.image("hunt", huntImg);
    this.load.image("cheese", cheeseImg);
  
    var url;
  
    //url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js';
    //console.log("rex plugin", typeof(rexvirtualjoystickplugin), rexvirtualjoystickplugin)
    url = rexvirtualjoystickplugin;
    console.log("url:", url);
    this.load.plugin('rexvirtualjoystickplugin', url, true);
  },
  
  create: function () {
    const cat = this.physics.add.sprite(50, 50, "cat");
    const cat2 = this.physics.add.sprite(550, 50, "cat2");
    //const rat = this.add.image(100, 100, "rat");
    const rat = this.physics.add.sprite(200, 200, "rat");
    
    const cheese = this.physics.add.sprite(350,350, "cheese");
  
    cat.setCollideWorldBounds(true);
    cat2.setCollideWorldBounds(true);
    rat.setCollideWorldBounds(true);
    cheese.setCollideWorldBounds(true);
  
    cheese.setDamping(0.2);
  
    cat2.setBounce(1.0);
  
    //this.physics.add.collider(cat, rat);
    this.physics.add.overlap(cat, rat, hunt, null, this);
    this.physics.add.overlap(cat2, rat, hunt, null, this);
  
    this.physics.add.overlap(rat, cheese, eatCheese, null, this);
  
    this.physics.add.collider(cat, cheese);
    this.physics.add.collider(cat2, cheese);
    this.physics.add.collider(cat, cat2);
  
    this.rat = rat;
    this.cat = cat;
    this.cat2 = cat2;
  
    cat.setScale(0.5);
    cat2.setScale(0.5);
    rat.setScale(0.25);
    cheese.setScale(0.4);
  
    this.dumpJoyStickState = dumpJoyStickState;
    console.log(dumpJoyStickState, this.dumpJoyStickState);
  
    this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
      x: 150,
      y: config.height - 150,
      radius: 70,
      
      base: this.add.circle(0, 0, 70, 0x888888, 0.4),
      thumb: this.add.circle(0, 0, 30, 0xcccccc, 0.4),
      //base: this.add.circle(0, 0, 70, 'rgba(0,128,128,50)'),
      //thumb: this.add.circle(0, 0, 30, 'rgba(222,222,222,50)'),
      // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
      // forceMin: 16,
      // enable: true
    })
    .on('update', this.dumpJoyStickState, this);
  
    this.text = this.add.text(0, 0);
    this.dumpJoyStickState();
  
    this.is_game_over = false;
    this.cheese_count = 0;
  
  },
  
  update: function (){
    if(this.is_game_over){
      return;
    }
    var rad = this.joyStick.angle / 180 * Math.PI;
    var force = Math.min(this.joyStick.force, 70);
    this.rat.setVelocityY(4.0 * force * Math.sin(rad));
    this.rat.setVelocityX(4.0 * force * Math.cos(rad));
  
    var dx = this.rat.x - this.cat.x;
    var dy = this.rat.y - this.cat.y;
    var norm = Math.sqrt(dx*dx + dy*dy);
    this.cat.setVelocityX(20 * dx / norm);
    this.cat.setVelocityY(20 * dy / norm);
  
    this.cat2.setVelocityX(this.cat2.body.velocity.x + 20 * (Math.random() - 0.5));
    this.cat2.setVelocityY(this.cat2.body.velocity.y + 20 * (Math.random() - 0.5));
  
  }

});

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 1400,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0 },
        debug: false
    }
  },
  scene: [MainScene]
};

const game = new Phaser.Game(config);

function dumpJoyStickState(){
  var cursorKeys = this.joyStick.createCursorKeys();
  var s = 'Key down: ';
  for (var name in cursorKeys) {
      if (cursorKeys[name].isDown) {
          s += name + ' ';
      }
  }
  s += '\n';
  s += ('Force: ' + Math.floor(this.joyStick.force * 100) / 100 + '\n');
  s += ('Angle: ' + Math.floor(this.joyStick.angle * 100) / 100 + '\n');
  this.text.setText(s);

}

function hunt(cat, rat){
  this.is_game_over = true;
  this.rat.destroy();

  var hunt_img = this.add.image(400, 300, "hunt");
  var that = this;
  hunt_img.setInteractive();
  hunt_img.on("pointerdown", function(){
    console.log("restart");
    this.scene.scene.restart();
  })

  this.end_text = this.add.text(400, 300);
  this.end_text.setFontSize(32);
  this.end_text.setText("Eat cheese:" + String(this.cheese_count));
}

function eatCheese(rat, cheese){
  console.log(rat.x, rat.y, cheese.x, cheese.y);
  rat.setScale(rat.scale * 1.05);
  cheese.setX(Math.random()*800);
  cheese.setY(Math.random()*600);

  this.cheese_count += 1;
}

// Check that service workers are supported
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
