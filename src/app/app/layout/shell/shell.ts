import { Component } from '@angular/core';
import { Siderbar } from '../siderbar/siderbar';
import { Header } from '../header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Siderbar ,Header],
  templateUrl: './shell.html',
  styleUrl: './shell.css'
})
export class Shell {

}

