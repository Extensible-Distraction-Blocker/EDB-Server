

CREATE DATABASE IF NOT EXISTS  `flexiblelock` DEFAULT CHARACTER SET utf8 ;



-- -----------------------------------------------------
-- Table `flexiblelock`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `flexiblelock`.`user` (
  `idx` INT(11) NOT NULL AUTO_INCREMENT,
  `id` VARCHAR(45) NOT NULL,
  `passwd` VARCHAR(300) NOT NULL,
  `salt` VARCHAR(300) NOT NULL,
  `grade` ENUM('USER', 'SERVICE_PROVIDER', 'ADMIN') NOT NULL DEFAULT 'USER',
  `email` VARCHAR(300) NULL DEFAULT NULL,
  PRIMARY KEY (`idx`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `flexiblelock`.`controled_object_user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `flexiblelock`.`controled_object_user` (
  `controled_object_user_idx` INT(11) NOT NULL,
  `control_user_idx` INT(11) NOT NULL,
    FOREIGN KEY (`control_user_idx`)
    REFERENCES `flexiblelock`.`user` (`idx`),
    FOREIGN KEY (`controled_object_user_idx`)
    REFERENCES `flexiblelock`.`user` (`idx`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `flexiblelock`.`external_service`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `flexiblelock`.`external_service` (
  `idx` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `url` VARCHAR(300) NULL DEFAULT NULL,
  PRIMARY KEY (`idx`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `flexiblelock`.`external_service_detail`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `flexiblelock`.`external_service_detail` (
  `idx` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `external_service_idx` INT(11) NOT NULL,
  PRIMARY KEY (`idx`),
    FOREIGN KEY (`external_service_idx`)
    REFERENCES `flexiblelock`.`external_service` (`idx`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `flexiblelock`.`lock`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `flexiblelock`.`lock` (
  `idx` INT(11) NOT NULL auto_increment,
  `name` VARCHAR(255) NOT NULL,
  `url` VARCHAR(300) NOT NULL,
  PRIMARY KEY (`idx`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `flexiblelock`.`user_external_service`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `flexiblelock`.`user_external_service` (
  `user_idx` INT(11) NOT NULL,
  `external_service_idx` INT(11) NOT NULL,
  `external_service_detail_idx` INT(11) NULL DEFAULT NULL,
  `if_achieve` ENUM('1', '0') NULL DEFAULT '0',
    FOREIGN KEY (`external_service_idx`)
    REFERENCES `flexiblelock`.`external_service` (`idx`),
    FOREIGN KEY (`user_idx`)
    REFERENCES `flexiblelock`.`user` (`idx`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `flexiblelock`.`user_lock`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `flexiblelock`.`user_lock` (
  `lock_idx` INT(11) NOT NULL,
  `user_idx` INT(11) NOT NULL,
  `configuration` VARCHAR(1000) NULL DEFAULT NULL,
  `start_time` DATE NULL DEFAULT NULL,
  `end_time` DATE NULL DEFAULT NULL,
    FOREIGN KEY (`lock_idx`)
    REFERENCES `flexiblelock`.`lock` (`idx`),
    FOREIGN KEY (`user_idx`)
    REFERENCES `flexiblelock`.`user` (`idx`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;



INSERT  INTO `flexiblelock`.`lock`(`name`,`url`) VALUES('naver','http://naver.com');
INSERT  INTO `flexiblelock`.`lock`(`name`,`url`) VALUES('stucy_lock','http://study_lock.com');
INSERT  INTO `flexiblelock`.`lock`(`name`,`url`) VALUES('google','http://google.com');
INSERT  INTO `flexiblelock`.`lock`(`name`,`url`) VALUES('study_hard','http://study_hard.com');
INSERT  INTO `flexiblelock`.`lock`(`name`,`url`) VALUES('daum','http://daum.com');
