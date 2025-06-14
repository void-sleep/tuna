package com.voidsleep.tuna.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AppException extends RuntimeException {

  private final HttpStatus httpStatus;

  public AppException() {
    super();
    this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  }

  public AppException(String message) {
    super(message);
    this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  }

  public AppException(String message, HttpStatus httpStatus) {
    super(message);
    this.httpStatus = httpStatus;
  }

  public AppException(String message, Throwable cause) {
    super(message, cause);
    this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  }

  public AppException(String message, Throwable cause, HttpStatus httpStatus) {
    super(message, cause);
    this.httpStatus = httpStatus;
  }

}
