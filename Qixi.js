// 灯动画 
var lamp = {
    elem: $('.b_background'),
    bright: function() {
        this.elem.addClass('lamp-bright')
    },
    dark: function() {
        this.elem.removeClass('lamp-bright');
    }
}

function doorAction(left, right, time) {
    var $door = $('.door');
    var doorLeft = $('.door-left');
    var doorRight = $('.door-right');
    var defer = $.Deferred();
    var count = 2;
    // 等待开门完成
    var complete = function() {
        if (count == 1) {
            defer.resolve();
            return;
        }
        count--;
    };
    doorLeft.transition({
        'left': left
    }, time, complete);
    doorRight.transition({
        'right': right
    }, time, complete);

    return defer;
}

// 开门
function openDoor() {
    return doorAction('-50%', '-50%', 2000);
}

// 关门
function shutDoor() {
    return doorAction('0%', '0%', 2000);
}

var instanceX;

/**
 * 小孩走路
 *@param {[type]} container [description]
 */
function BoyWalk() {
	var container = $('#content');
	// 页面可视区域
	var visualWidth = container.width();
	var visualHeight = container.height();
	
	var swipe = Swipe(container);
	//获取数据
	var getValue = function(className) {
		var $elem = $('' + className + '');
		// 走路的路线坐标
		return {
			height: $elem.height(),
			top: $elem.position().top
		};
	}

	// 路的Y轴
	var PathY = function() {
		var data = getValue('.a_background_middle');
		return data.top + data.height / 2;
	}();
	
	var $boy = $('#boy');
	var boyHeight = $boy.height();
	// 修正小男孩的正确位置
	$boy.css({
		top: PathY - boyHeight + 25
	});


	////////////////////////////////////////////////////
	//=====================动画处理===================//
	////////////////////////////////////////////////////
	//暂停走路
	function pauseWalk() {
		$boy.addClass('pauseWalk');
	}
	
	// 恢复走路
	function restoreWalk() {
		$boy.removeClass('pauseWalk');
	}
	
	// css3的动作变化
	function slowWlak() {
		$boy.addClass('slowWalk');
	}

	// 用transition做运动
	function startRun(options, runTime) {
		var dfdPlay = $.Deferred();
		// 恢复走路
		restoreWalk();
		// 运动的属性
		$boy.transition(
			options, 
			runTime, 
			'linear', 
			function() {
				dfdPlay.resolve(); // 动画完成
			});
		return dfdPlay;
	}

	// 开始走路
	function walkRun(time, distX, disY) {
		time = time || 3000;
		// 脚动作
		slowWlak();
		// 开始走路
		var d1 = startRun({
			'left': distX + 'px',
			'top': disY ? disY : undefined
		}, time);
		return d1;
	}

	// 走进商店
	function walkToShop(runTime) {
		var defer = $.Deferred();
		var doorObj = $('.door');
		// 门的坐标
		var offsetDoor = doorObj.offset();
		var doorOffsetLeft = offsetDoor.left;
		// 小孩当前的坐标
		var offsetBoy = $boy.offset();
		var boyOffsetLeft = offsetBoy.left;

		// 当前需要移动的坐标
		instanceX = (doorOffsetLeft + doorObj.width() / 2) - (boyOffsetLeft + $boy.width() / 2);
		
		// 开始走路
		var walkPlay = startRun({
			transform: 'translateX(' + instanceX + 'px),scale(0.3, 0.3)',
			opacity: 0.1
		}, runTime);
		// 走路完毕
		walkPlay.done(function() {
			$boy.css({
				opacity: 0
			});
			defer.resolve();
		});
		return defer;
	}

	// 取花
	function takeFlower() {
		// 增加演示等待效果
		var defer = $.Deferred();
		setTimeout(function() {
			// 取花
			$boy.addClass('slowFlowerWalk');
			defer.resolve();
		}, 1000);
		return defer;
	}

	// 走出店
	function walkOutShop(runTime) {
		var defer = $.Deferred();
		restoreWalk();
		// 开始走路
		var walkPlay = startRun({
			transform: 'translateX(' + instanceX + 'px),scale(1,1)',
			opacity: 1
		}, runTime);
		// 走路完毕
		walkPlay.done(function() {
			defer.resolve();
		});
		return defer;
	}
	
	// 计算移动距离
	function calculateDist(direction, proportion) {
		return (direction == "x" ? visualWidth : visualHeight) * proportion;
	}

	return {
		// 开始走路
		walkTo: function(time, proportionX, proportionY) {
			var distX = calculateDist('x', proportionX);
			var distY = calculateDist('y', proportionY);
			return walkRun(time, distX, distY);
		},
		// 走进商店
		toShop: function() {
			return walkToShop.apply(null, arguments);
		},
		takeFlower: function() {
			return takeFlower();
		},
		// 走出商店
		outShop: function() {
			return walkOutShop.apply(null, arguments);
		},
		// 停止走路
		stopWalk: function() {
			pauseWalk();
		},
		setColorer: function(value) {
			$boy.css('background-color', value);
		}
	}
}

