from cap120.Robot import Robot
from dorna2 import Dorna
import time
from cap120 import utils
# Connect to the robot

def main():
    vel = 1900
    accel = 900
    jerk = 900
    turn = 0
    cont = True

    ip = "169.254.81.54"
    dorna = Dorna()
    dorna.connect(ip)

    robot = Robot(dorna, vel, accel, jerk, turn, cont)

    robot.startup()
    robot.dorna.output(4,1)
    robot.dorna.output(0,1)
    robot.dorna.jmove(**robot.no_rel,j1=70, j2=0)
    robot.dorna.jmove(**robot.no_rel,j0=0)


    # robot.dynamic_slot(row=19, col=1)
    # robot.dynamic_slot(row=20, col=1)
    # robot.dynamic_slot(row=21, col=1)
    # robot.dynamic_slot(row=22, col=1)
    # robot.dynamic_slot(row=23, col=1)
    # robot.dynamic_slot(row=24, col=1)
    # robot.dynamic_slot(row=25, col=1)
    # robot.dynamic_slot(row=j, col=i)

    for j in range(1,26):
        for i in range(1,4):
            # if i == 1 and j == 1:
            #     i = 1
            #     j = 19
            print(f"Count: {utils.get_count()}")
            if utils.check_count():
                print(f"Linear Actuator has been raised at count: {utils.get_count()}")
                robot.linear_act()

            utils.count()
            print(f"Performing row={j}, col={i}")
            while not robot.dynamic_slot(row=j, col=i):
                utils.count()
                print(f"duplicate seal or no seal detected, redoing row={j}, col={i}")
                robot.dorna.jmove(**robot.no_rel,j1=70, j2=0)
            robot.dorna.jmove(**robot.no_rel,j1=70, j2=0)
    
    # dorna.linear_act(1)


# for j in range(1,25):
#     for i in range(1,4):
#         robot.jmove(rel=0,vel=vel,accel=accel,jerk=jerk,turn=turn,cont=cont,j1=70)
#         robot.jmove(rel=0,vel=vel,accel=accel,jerk=jerk,turn=turn,cont=cont,j2=0)
#         dynamic_slot(row=j, col=i)


#     dorna.robot.close()

if __name__ == "__main__":
    main()