package be.ehb.carrymystuff.DTO;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
@Data
public class AdminBookingRequest {


    private Long customerId;
    private Long vehicleId;
    private String fromAddress;
    private String toAddress;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime moveDate;



}
