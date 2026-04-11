package com.examination.OnlineExamination;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class OnlineExaminationApplication {

	public static void main(String[] args) {
		SpringApplication.run(OnlineExaminationApplication.class, args);
	}

}
